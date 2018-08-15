Elastisearch command line interface

[Install pkg -global]
npm i -g pkg

[Build on Windows 10, Node 8.x]
pkg elasti-cli.js --target node8-win-x64 --output elasti-cli.exe

Download Elasticsearch
https://www.elastic.co/downloads/elasticsearch

Extract zip file,
Run bin/elasticsearch (or bin\elasticsearch.bat on Windows)
Default service running at http://localhost:9200

[Test elastisearch is running]
./elasti-cli get
./elasti-cli get '_cat'

