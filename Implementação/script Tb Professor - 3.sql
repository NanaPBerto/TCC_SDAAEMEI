use SDAAEMEI;

create table Professor(
cod integer not null auto_increment,
nome varchar (30),
login varchar (20), /*falta o check*/
senha varchar (10),  /*falta o check*/
rg integer,
cpf integer,
email varchar (50),
fone integer,
imagem blob,
formacao varchar (30),
reg_cfep integer,
bairro varchar (50),
rua varchar (50),
num_endereco integer,
obs varchar (100)
uf integer,
cidade integer,
instituicao integer,
primary key (cod),
foreign key (uf) references UF (cod),
foreign key (cidade) references Cidade (cod),
foreign key (instituicao) references Instituicao (cod));