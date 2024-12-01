use SDAAEMEI;

create table Atividades(
cod integer not null auto_increment,
nome varchar (30),
descricao varchar (100),
objetivo varchar (70),
indicacao varchar (20),
vagas integer,
duracao time,
recursos varchar (80),
condicoes varchar (80),
imagem blob,
musica blob,
partitura blob,
obs varchar (100),
desenvolvedor integer,
classificacao integer,
tipo integer,
primary key (cod),
foreign key (desenvolvedor) references Professor (cod),
foreign key (classificacao) references Classificacao (cod),
foreign key (tipo) references Tipo (cod));