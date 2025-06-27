use SDAAEMEI;

create table UF(
cod integer not null auto_increment,
descricao char (2) default('SC'),
primary key (cod));

create table Cidade(
cod integer not null auto_increment,
descricao varchar (35) default('Sombrio'),
primary key (cod));

create table Instituicao(
cod integer not null auto_increment,
descricao varchar (50),
primary key (cod));