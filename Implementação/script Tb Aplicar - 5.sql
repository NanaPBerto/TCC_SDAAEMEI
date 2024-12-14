use SDAAEMEI;

create table Aplicar(
cod integer not null auto_increment,
dataa date,
hora time,
turma varchar (15),
obs varchar (100),
cod_professor integer,
cod_atividades integer,
primary key (cod),
foreign key (cod_professor) references Professor (cod),
foreign key (cod_atividades) references Atividades (cod));
