use SRAMEI;

create table Musico(
cod integer not null auto_increment,
nome varchar (30),
login varchar (20), /*falta o check*/
senha varchar (10),  /*falta o check*/
cpf integer,
email varchar (50),
fone integer,
imagem blob,
cidade varchar (50),
minicurriculo blob,
obs varchar (100),
uf integer,
primary key (cod),
foreign key (uf) references UF (cod)
);