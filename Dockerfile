FROM quay.io/astrox11/xstro:latest
RUN git clone https://github.com/AstroX11/Xstro /Xstro
WORKDIR /Xstro
RUN npm i -g yarn
RUN yarn
EXPOSE 8000
CMD ["yarn" "start"]