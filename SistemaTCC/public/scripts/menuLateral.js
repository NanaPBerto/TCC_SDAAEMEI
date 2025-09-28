function abreMenuLateral() {
    const menuLateral = document.getElementById("menuLateral");
    const btnMenuLateral = document.getElementById("btnMenuLateral");
    menuLateral.classList.toggle("aberto");
    btnMenuLateral.classList.toggle("ativo");
}
 
function fechaMenuLateral() {
    const menuLateral = document.getElementById("menuLateral");
    const btnMenuLateral = document.getElementById("btnMenuLateral");
    menuLateral.classList.remove("aberto");
    btnMenuLateral.classList.remove("ativo");
}

