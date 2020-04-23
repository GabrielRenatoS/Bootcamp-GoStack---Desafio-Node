const express = require("express");
const cors = require("cors");

const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function RepositoryTitleInUse(request, response, next) {
  const { title } = request.body;

  const repositoryId = repositories.find(repository => repository.title === title);

  if (repositoryId < 0) {
    return response.status(400).json({ error : "Repository title already in use."})
  }

  return next();
}

function RepositoryUrlInUse(request, response, next) {
  const { url } = request.body;

  const repositoryId = repositories.find(repository => repository.url === url);

  if (repositoryId >= 0) {
    return response.status(400).json({ error : "Repository url already in use."})
  }

  return next();
}

function RepositoryExist(request, response, next) {
  const { id } = request.params;

  const repositoryId = repositories.findIndex(repository => repository.id === id);

  if (repositoryId < 0) {
    return response.status(400).json({ error : "Repository not found."})
  }

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", RepositoryTitleInUse, RepositoryUrlInUse, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", RepositoryExist, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryId = repositories.findIndex(repository => repository.id === id); 

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositoryId].likes
  };

  repositories[repositoryId].title = title;
  repositories[repositoryId].url = url;
  repositories[repositoryId].techs = techs;

  //repositories[repositoryId] = repository;


  return response.json(repository);

});

app.delete("/repositories/:id", RepositoryExist, (request, response) => {
  const { id } = request.params;

  const repositoryId = repositories.findIndex(repository => repository.id === id);


  repositories.splice(repositoryId, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", RepositoryExist, (request, response) => {
  const { id } = request.params;

  const repositoryId = repositories.findIndex(repository => repository.id === id);  

  repositories[repositoryId].likes += 1;

  return response.json(repositories[repositoryId]);
});

module.exports = app;
