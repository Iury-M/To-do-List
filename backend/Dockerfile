# Usar a imagem oficial do Node.js como base
FROM node:18

# Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiar o package.json e o package-lock.json para o container
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar todos os arquivos do projeto para dentro do container
COPY . .

# Expor a porta que o servidor vai rodar (alterar para 4000, caso necessário)
EXPOSE 4000

# Comando para rodar o servidor quando o container iniciar
CMD ["npm", "start"]
