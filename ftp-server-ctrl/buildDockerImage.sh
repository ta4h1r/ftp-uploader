pass="***"
containerName="ftp-server-ctrl"
networkName="custom0"
localPort=2000
containerPort=2008
imageName="ftp-server"
tag="v1"

# Tagging to push image to a cloud registry
# $repo = "ta4h1r"
# docker tag $imageName:$tag $repo/$imageName:$tag
# docker push $repo/$imageName:$tag

echo $pass | sudo docker build -t $imageName:$tag .
echo $pass | sudo docker run -itd --name=$containerName --network=$networkName --restart unless-stopped -p $localPort:$containerPort -m 300M $imageName:$tag
