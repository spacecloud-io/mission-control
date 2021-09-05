rm -rf build/
rm ./mission-control.zip
npm i
npm run build
zip mission-control.zip -r ./build/
gsutil rm gs://space-cloud/mission-control/mission-control-v0.21.5.zip
gsutil cp ./mission-control.zip gs://space-cloud/mission-control/mission-control-v0.21.5.zip
