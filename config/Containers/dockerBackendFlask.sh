#Al iniciar instancia

sudo apt update
apt list --upgradable

#Ahora instalamos docker

sudo apt upgrade -y
sudo apt-get remove docker docker-engine docker.io containerd runc
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-cache policy docker-ce
sudo apt install docker-ce -y

# ------- PARA EVITAR USAR "SUDO DOCKER"
#Creamos contraseña
sudo passwd

# Creacion de usuario
sudo usermod -aG docker ${USER}
sudo su - ${USER}
# ---------------------------------------- 


# Creamos la imagen de nuestra app

docker build -t emerginet/backend .

# Corremos nuestra imagen

docker run -d -p 5000:5000 emerginet/backend