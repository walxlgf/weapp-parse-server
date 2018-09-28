FROM node

ENV PARSE_HOME /parse
ENV CLOUD_CODE_HOME ${PARSE_HOME}/cloud
RUN mkdir -p ${PARSE_HOME}
ENV PORT 1337

ADD ./package.json ${PARSE_HOME}
WORKDIR ${PARSE_HOME}
RUN npm install

#上传的github时，要把这两个打开 
#本地使用docker-compose制作时要注释掉
ADD ./cloud $CLOUD_CODE_HOME/
ADD ./index.js ${PARSE_HOME}

ENV NODE_PATH .

CMD ["npm", "start"]