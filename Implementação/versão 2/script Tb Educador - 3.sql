use SRAMEI;

create table Educador(
cod integer not null auto_increment,
nome varchar (50),
login varchar (20),
senha varchar (10),
cidade varchar (50),
uf integer,
primary key (cod),
foreign key (uf) references UF (cod)
);
