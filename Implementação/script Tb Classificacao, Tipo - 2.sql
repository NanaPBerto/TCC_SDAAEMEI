use SDAAEMEI;

create table Classificacao(
cod integer not null auto_increment,
descricao varchar (20),
primary key (cod));

create table Tipo(
cod integer not null auto_increment,
descricao varchar (30),
primary key (cod));