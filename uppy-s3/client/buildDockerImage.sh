pass="***"
containerName="uppy-client"
networkName="custom0"
localPort=3000
containerPort=80
imageName="uppy-client"
tag="v1"

# Tagging to push image to a cloud registry
# $repo = "ta4h1r"
# docker tag $imageName:$tag $repo/$imageName:$tag
# docker push $repo/$imageName:$tag

echo $pass | sudo docker build -t $imageName:$tag .
echo $pass | sudo docker run -itd --name=$containerName --network=$networkName --restart unless-stopped -p $localPort:$containerPort -m 1G $imageName:$tag
