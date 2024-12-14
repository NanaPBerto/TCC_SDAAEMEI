 //Funções para sumir e reaparecer a lupa na barra de pesquisa
function someLupa() {
    document.getElementById("Lupa").style.display = "none";
  }
  
  function mostraLupa() {
    document.getElementById("Lupa").style.display = "inline";
    document.getElementById("pesquisa").value = ""; //MUDAR ISSO DEPOIS 
  }