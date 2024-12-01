use SDAAEMEI

create table Registros(
cod integer not null auto_increment,
dataa date default, /*falta o default e o check*/
registros varchar (50)
cod_atividades integer,
cod_aplicacao integer,
primary key (cod),
foreign key (cod_atividades) references Atividades (cod),
foreign key (cod_aplicacao) references Aplicar (cod));

