use SRAMEI;

/*Tb Uf conectada com educador e músico*/
create table UF(
cod integer not null auto_increment,
descricao char (2) default('SC'),
primary key (cod));

/*Tabelas conectadas com atividades*/
create table Classificacao(
cod integer not null auto_increment,
descricao varchar (20),
primary key (cod));

create table Tipo(
cod integer not null auto_increment,
descricao varchar (30),
primary key (cod));

