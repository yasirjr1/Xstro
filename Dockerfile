FROM quay.io/astrox11/xstro:latest
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"
RUN git clone https://github.com/AstroX11/Xstro /Xstro
WORKDIR /Xstro
RUN yarn
RUN npm install -g pm2
EXPOSE 8000
CMD ["pm2-runtime", "start", "yarn", "--interpreter", "bash", "--name", "xstro", "--", "start"]