pass="***"
containerName="s3-signer"
networkName="custom0"
localPort=2001
containerPort=1000
imageName="s3-signer"
tag="v1"

# volumeName="volume1"
# containerDirectory="/temp"
# Make this part of the run command if you want to use volumes: -v $volumeName:$containerDirectory

# Tagging to push image to a cloud registry
# $repo = "ta4h1r"
# docker tag $imageName:$tag $repo/$imageName:$tag
# docker push $repo/$imageName:$tag

echo $pass | sudo docker build -t $imageName:$tag .
echo $pass | sudo docker run -itd --name=$containerName --network=$networkName --restart unless-stopped -p $localPort:$containerPort -m 300M $imageName:$tag
