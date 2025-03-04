import * as fs from "fs/promises";
import * as path from "path";
import { EventEmitter } from "events";
import { createReadStream, createWriteStream, Stats } from "fs";

/**
 * Advanced file transfer manager with progress tracking and error handling
 */
class FileTransferManager extends EventEmitter {
    private currentPath: string;
    private futurePath: string;
    private activeTransfers: Map<string, Promise<void>>;
    private isPaused: boolean;
    private chunkSize: number;

    /**
     * @param current - Source directory path
     * @param future - Destination directory path
     * @param chunkSize - Size of chunks for streaming (default: 64KB)
     */
    constructor(current: string, future: string, chunkSize: number = 64 * 1024) {
        super();
        this.currentPath = path.resolve(current);
        this.futurePath = path.resolve(future);
        this.activeTransfers = new Map();
        this.isPaused = false;
        this.chunkSize = chunkSize;

        // Ensure directories exist
        this.initializeDirectories().catch((err) => {
            this.emit("error", err);
        });
    }

    /**
     * Initialize source and destination directories
     */
    private async initializeDirectories(): Promise<void> {
        await Promise.all([fs.mkdir(this.currentPath, { recursive: true }), fs.mkdir(this.futurePath, { recursive: true })]);
    }

    /**
     * Transfer a single file with progress tracking
     */
    async transferFile(fileName: string, options: TransferOptions = {}): Promise<void> {
        const { overwrite = false, retryAttempts = 3, retryDelay = 1000 } = options;

        const sourcePath = path.join(this.currentPath, fileName);
        const destPath = path.join(this.futurePath, fileName);
        const transferId = `${fileName}-${Date.now()}`;

        const transferPromise = this.executeTransferWithRetry(sourcePath, destPath, transferId, { overwrite, retryAttempts, retryDelay });

        this.activeTransfers.set(transferId, transferPromise);

        try {
            await transferPromise;
            this.emit("transferComplete", { fileName, sourcePath, destPath });
        } catch (error) {
            this.emit("error", error);
        } finally {
            this.activeTransfers.delete(transferId);
        }
    }

    /**
     * Execute file transfer with retry logic and progress tracking
     */
    private async executeTransferWithRetry(sourcePath: string, destPath: string, transferId: string, options: TransferOptions & { retryAttempts: number; retryDelay: number }): Promise<void> {
        let attempts = 0;
        let stats: Stats;

        try {
            stats = await fs.stat(sourcePath);
        } catch (error) {
            throw new Error(`Source file not found: ${sourcePath}`);
        }

        if (!options.overwrite && (await this.fileExists(destPath))) {
            throw new Error(`Destination file already exists: ${destPath}`);
        }

        while (attempts < options.retryAttempts) {
            try {
                await this.streamFile(sourcePath, destPath, stats.size, transferId);
                return;
            } catch (error) {
                attempts++;
                if (attempts === options.retryAttempts) {
                    throw new Error(`Failed to transfer ${sourcePath} after ${attempts} attempts: ${error.message}`);
                }
                await new Promise((resolve) => setTimeout(resolve, options.retryDelay));
            }
        }
    }

    /**
     * Stream file with progress updates
     */
    private async streamFile(sourcePath: string, destPath: string, totalSize: number, transferId: string): Promise<void> {
        const readStream = createReadStream(sourcePath, { highWaterMark: this.chunkSize });
        const writeStream = createWriteStream(destPath);

        let transferred = 0;

        return new Promise((resolve, reject) => {
            readStream
                .on("data", (chunk: Buffer) => {
                    if (this.isPaused) {
                        readStream.pause();
                        return;
                    }
                    transferred += chunk.length;
                    const progress = (transferred / totalSize) * 100;
                    this.emit("progress", { transferId, progress, transferred, totalSize });
                })
                .on("error", reject)
                .pipe(writeStream)
                .on("error", reject)
                .on("finish", resolve);
        });
    }

    /**
     * Transfer multiple files concurrently
     */
    async transferMultiple(files: string[], options: TransferOptions & { concurrency?: number } = {}): Promise<void> {
        const { concurrency = 3, ...transferOptions } = options;
        const queue = [...files];

        const executeTransfer = async () => {
            while (queue.length > 0 && !this.isPaused) {
                const file = queue.shift();
                if (file) {
                    await this.transferFile(file, transferOptions);
                }
            }
        };

        await Promise.all(Array(Math.min(concurrency, files.length)).fill(null).map(executeTransfer));
    }

    /**
     * Utility method to check if file exists
     */
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Pause all active transfers
     */
    pause(): void {
        this.isPaused = true;
        this.emit("paused");
    }

    /**
     * Resume all paused transfers
     */
    resume(): void {
        this.isPaused = false;
        this.emit("resumed");
    }

    /**
     * Cancel all active transfers
     */
    async cancel(): Promise<void> {
        this.isPaused = true;
        for (const [id, transfer] of this.activeTransfers) {
            // Note: Actual stream cancellation would require more complex handling
            this.emit("cancelled", { transferId: id });
        }
        this.activeTransfers.clear();
    }

    /**
     * Get current transfer status
     */
    getStatus(): TransferStatus {
        return {
            activeTransfers: this.activeTransfers.size,
            isPaused: this.isPaused,
            sourcePath: this.currentPath,
            destinationPath: this.futurePath,
        };
    }
}

interface TransferOptions {
    overwrite?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
}

interface TransferStatus {
    activeTransfers: number;
    isPaused: boolean;
    sourcePath: string;
    destinationPath: string;
}

export { FileTransferManager };
export default FileTransferManager;
