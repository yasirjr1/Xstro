/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Got } from 'got';
import got from 'got';
import { EventEmitter } from 'events';

/**
 * Advanced Git repository analyzer with real-time updates and detailed statistics
 */
class GitRepoAnalyzer extends EventEmitter {
  private readonly gitUrl: string;
  private readonly apiUrl: string;
  private readonly isPrivate: boolean;
  private readonly token?: string;
  private httpClient: Got;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number;
  private pollInterval?: NodeJS.Timeout;
  private isPolling: boolean;

  constructor(
    gitUrl: string,
    opts: {
      isPrivate: boolean;
      token?: string;
      cacheTTL?: number;
      pollingInterval?: number;
    },
  ) {
    super();
    this.gitUrl = gitUrl;
    this.isPrivate = opts.isPrivate;
    this.token = opts.token;
    this.cache = new Map();
    this.cacheTTL = (opts.cacheTTL || 300) * 1000;
    this.isPolling = false;

    this.apiUrl = this.parseGitUrl(gitUrl);

    // Initialize HTTP client with got
    this.httpClient = got.extend({
      prefixUrl: this.apiUrl,
      headers: {
        accept: 'application/vnd.github.v3+json',
        ...(this.token && { authorization: `Bearer ${this.token}` }),
      },
      timeout: { request: 10000 },
      retry: {
        limit: 2,
        methods: ['GET'],
      },
    });

    if (opts.pollingInterval) {
      this.startPolling(opts.pollingInterval * 1000);
    }

    this.validateConfig().catch((err) => this.emit('error', err));
  }

  private parseGitUrl(url: string): string {
    const match = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    return `https://api.github.com/repos/${match[1]}/${match[2]}`;
  }

  private async validateConfig(): Promise<void> {
    if (this.isPrivate && !this.token) {
      throw new Error('Private repository requires authentication token');
    }
    try {
      await this.httpClient.get('');
    } catch (error) {
      throw new Error(`Failed to connect to repository: ${error.message}`);
    }
  }

  private async getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  async getLatestCommit(): Promise<CommitInfo> {
    return this.getCachedOrFetch('latestCommit', async () => {
      const response = await this.httpClient.get('commits').json<any[]>();
      const commit = response[0];
      return {
        sha: commit.sha,
        message: commit.commit.message,
        date: new Date(commit.commit.author.date),
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          login: commit.author?.login,
        },
      };
    });
  }

  async getContributors(): Promise<Contributor[]> {
    return this.getCachedOrFetch('contributors', async () => {
      const response = await this.httpClient.get('contributors').json<any[]>();
      return response.map((c) => ({
        login: c.login,
        contributions: c.contributions,
        avatarUrl: c.avatar_url,
        profileUrl: c.html_url,
      }));
    });
  }

  async getRepoStats(): Promise<RepoStats> {
    return this.getCachedOrFetch('stats', async () => {
      const response = await this.httpClient.get('').json<any>();
      return {
        forks: response.forks_count,
        stars: response.stargazers_count,
        watchers: response.watchers_count,
        openIssues: response.open_issues_count,
      };
    });
  }

  async getCommitSummary(limit: number = 10): Promise<CommitSummary[]> {
    return this.getCachedOrFetch(`commitSummary-${limit}`, async () => {
      const response = await this.httpClient.get(`commits?per_page=${limit}`).json<any[]>();
      return response.map((c) => ({
        sha: c.sha,
        message: c.commit.message.split('\n')[0],
        date: new Date(c.commit.author.date),
        author: c.commit.author.name,
      }));
    });
  }

  async getCodeChurn(): Promise<CodeChurn> {
    return this.getCachedOrFetch('codeChurn', async () => {
      const stats = await this.httpClient.get('stats/code_frequency').json<number[][]>();
      const additions = stats.reduce((sum, week) => sum + week[1], 0);
      const deletions = stats.reduce((sum, week) => sum + week[2], 0);
      return { additions, deletions, totalChanges: additions + Math.abs(deletions) };
    });
  }

  async getHealthMetrics(): Promise<HealthMetrics> {
    return this.getCachedOrFetch('health', async () => {
      const [issues, prs] = await Promise.all([
        this.httpClient.get('issues').json<unknown[]>(),
        this.httpClient.get('pulls').json<unknown[]>(),
      ]);
      return {
        avgIssueAge: this.calculateAvgAge(issues),
        avgPrAge: this.calculateAvgAge(prs),
        openPrCount: prs.length,
        openIssueCount: issues.length,
      };
    });
  }

  async getContributionTrends(): Promise<ContributionTrends> {
    return this.getCachedOrFetch('trends', async () => {
      const stats = await this.httpClient.get('stats/participation').json<any>();
      return {
        ownerCommits: stats.owner,
        allCommits: stats.all,
        weeklyAverage: stats.all.reduce((a: number, b: number) => a + b, 0) / stats.all.length,
      };
    });
  }

  async getFileStructure(): Promise<FileStructure> {
    return this.getCachedOrFetch('structure', async () => {
      const tree = await this.httpClient.get('git/trees/HEAD?recursive=1').json<any>();
      const files = tree.tree.filter((item: any) => item.type === 'blob');
      return {
        fileCount: files.length,
        avgFileSize: files.reduce((sum: number, f: any) => sum + (f.size || 0), 0) / files.length,
        uniqueExtensions: [...new Set(files.map((f: any) => f.path.split('.').pop()))].length,
      };
    });
  }

  async getCommitSentiment(): Promise<SentimentAnalysis> {
    return this.getCachedOrFetch('sentiment', async () => {
      const commits = await this.getCommitSummary(50);
      const sentiment = this.analyzeSentiment(commits.map((c) => c.message));
      return sentiment;
    });
  }

  async getDependencies(): Promise<DependencyInfo> {
    return this.getCachedOrFetch('dependencies', async () => {
      const contents = await this.httpClient.get('contents').json<any[]>();
      const packageJson = contents.find((f: any) => f.name === 'package.json');
      if (!packageJson) return { dependencyCount: 0, dependencies: {} };

      const pkg = await this.httpClient.get(packageJson.download_url).json<any>();
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return {
        dependencyCount: Object.keys(deps).length,
        dependencies: deps,
      };
    });
  }

  startPolling(interval: number): void {
    if (this.isPolling) return;
    this.isPolling = true;

    this.pollInterval = setInterval(async () => {
      try {
        const [latest, stats] = await Promise.all([this.getLatestCommit(), this.getRepoStats()]);
        this.emit('update', { latestCommit: latest, stats });
      } catch (error) {
        this.emit('error', error);
      }
    }, interval);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.isPolling = false;
    }
  }

  private calculateAvgAge(items: any[]): number {
    if (!items.length) return 0;
    const now = Date.now();
    return (
      items.reduce((sum: number, item: any) => {
        return sum + (now - new Date(item.created_at).getTime());
      }, 0) /
      items.length /
      (1000 * 60 * 60 * 24)
    );
  }

  private analyzeSentiment(messages: string[]): SentimentAnalysis {
    const positiveWords = ['fix', 'improve', 'enhance', 'add', 'new'];
    const negativeWords = ['bug', 'error', 'fail', 'broken', 'issue'];

    let positive = 0;
    let negative = 0;

    messages.forEach((msg) => {
      const words = msg.toLowerCase().split(/\s+/);
      positive += words.filter((w) => positiveWords.includes(w)).length;
      negative += words.filter((w) => negativeWords.includes(w)).length;
    });

    return {
      positiveScore: positive,
      negativeScore: negative,
      overallSentiment: (positive - negative) / (positive + negative) || 0,
    };
  }
}

interface CommitInfo {
  sha: string;
  message: string;
  date: Date;
  author: {
    name: string;
    email: string;
    login?: string;
  };
}

interface Contributor {
  login: string;
  contributions: number;
  avatarUrl: string;
  profileUrl: string;
}

interface RepoStats {
  forks: number;
  stars: number;
  watchers: number;
  openIssues: number;
}

interface CommitSummary {
  sha: string;
  message: string;
  date: Date;
  author: string;
}

interface CodeChurn {
  additions: number;
  deletions: number;
  totalChanges: number;
}

interface HealthMetrics {
  avgIssueAge: number;
  avgPrAge: number;
  openPrCount: number;
  openIssueCount: number;
}

interface ContributionTrends {
  ownerCommits: number[];
  allCommits: number[];
  weeklyAverage: number;
}

interface FileStructure {
  fileCount: number;
  avgFileSize: number;
  uniqueExtensions: number;
}

interface SentimentAnalysis {
  positiveScore: number;
  negativeScore: number;
  overallSentiment: number;
}

interface DependencyInfo {
  dependencyCount: number;
  dependencies: Record<string, string>;
}
export { GitRepoAnalyzer };
export default GitRepoAnalyzer;
