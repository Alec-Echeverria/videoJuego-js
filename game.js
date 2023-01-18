const canvas=document.querySelector("#game");

//Creamos contexto del canvas, en este caso renderizar gráficos en 2d 
const game=canvas.getContext("2d")
const btnsUp=document.querySelector("#up")
const btnsLeft=document.querySelector("#left")
const btnsRight=document.querySelector("#right")
const btnsDown=document.querySelector("#down")
const spanLive=document.querySelector("#lives")
const spanTime=document.querySelector("#time")
const spanRecord=document.querySelector("#record")
const pResult=document.querySelector("#result")

const NewGame= document.getElementById("newGame")


let canvasSize
let elementsSize;
let level=0
let lives=3;

let timeStart;
let timePlayer;
let timeInterval;

//jugador
const playerPosition={
    x:undefined,
    y:undefined
}

//Coordenadas del regalo
const giftPosition={
  x:undefined,
  y:undefined
}

let enemyPositions=[];


//Escuchar evento de carga de la pagina -- y ejecutamos la funcion de iniciar juego
window.addEventListener("load",setCanvasSize)
window.addEventListener("resize",setCanvasSize)

function setCanvasSize(){

    if(window.innerHeight>window.innerWidth){
        canvasSize=window.innerWidth*0.8;
    }else{
        canvasSize=window.innerHeight*0.8;
    }
    //asignamos atributos HTML al canvas a traves del metodo setAttibute, en este caso de altura y ancho
    canvasSize=Number(canvasSize.toFixed(0))
    canvas.setAttribute("width",canvasSize);
    canvas.setAttribute("height",canvasSize); 

    elementsSize=canvasSize/10;
    playerPosition.x=undefined;
    playerPosition.y=undefined;
    //Llamamos donde se renderiza el mapa
    startGame();
}

//Funcion de inicio del juego
function startGame(){

    // console.log({
    //     canvasSize,
    //     elementsSize
    // })
    

    game.font=`${elementsSize}px Verdana ` ;  //creamos el tamaño del elemento y la insertamos en el html
    game.textAlign= "end";         


    const mapa=maps[level]  //Escojemos el mapa a renderizar
    if (!mapa){
        gameWin() //Si ya no hay mapas se ejecuta la funcion de victoria
        return //Paramos la ejecucion del restante de la funcion
    }

    //Inicio tiempo de juego
    if(!timeStart){
      timeStart=Date.now();
      timeInterval=setInterval(showTime,100);
      showRecord()

    }

    //mostrar vidas jugador
    showLifes()

    //Conseguir las filas (rows) del mapa
    // el metodo trim quita los espacios externos de los string y el metodo .split genera arreglos a partir de una condicion, en este caso los genera a partir del salto de linea (\n)
    const mapRows=mapa.trim().split("\n")
    // console.log(mapRows)

    //Creamos las columnas de las filas, para ello volvemos un vector los elementos que estan dentro de cada elemento (string) que ocupa una posicion dentro del vector mapRows
    const mapRowsColumns=mapRows.map(row => row.trim().split(""))   //mapRowsColumns[][] accedemos a un elemento especifico

    // console.log(mapRowsColumns)

    
    //Insertamos los elementos en el canvas a traves de la coincidencia que este tenga en el Obj emoji, usamos para ello las cordenadas que ofrece mapRowsColumns
    // for (let row = 1; row <= 10; row++) {
    //     for (let column = 1; column <=10; column++) {   //mapRowsColumns[row-1][column-1]] => le restamos el para que tome las cordenadas desde [0][0]
    //         game.fillText(emojis[mapRowsColumns[row-1][column-1]], elementsSize * column,elementsSize*row);
    //     } 
    // }

    enemyPositions=[];
    game.clearRect(0,0,canvasSize,canvasSize); //Borra canvas cada vez  que llamamos la función
    //!Remplazo del ciclo for anindado- vamos recorriendo columna por columna en cada fila--- la variable col tendra la posición corrspondiente
    mapRowsColumns.forEach((rows,rowIndex) => {     //El metodo for each me permite obtener el indice
        rows.forEach((col,colIndex)=>{
            // console.log(emojis[col])
            const emoji=emojis[col]

            // console.log({rows,rowIndex,col,colIndex})
            const posX=(colIndex+1)*elementsSize        //Se suma 1 ya que la alineacion de los elementos canvas esta en END
            const posY=(rowIndex+1)*elementsSize

            //insertamos al jugador cuand Col sea igual a al emoji puerta, para ello usamos las coordenadas correspondientes
            if(col=="O"){
                if(!playerPosition.x && !playerPosition.y){
                    playerPosition.x=posX;
                    playerPosition.y=posY;
                    console.log({posX,posY,playerPosition})
                }
            }else if(col=="I"){
              giftPosition.x=posX
              giftPosition.y=posY
            }else if(col=="X"){
              enemyPositions.push({
                x:posX,
                y:posY
              })
            }
            game.fillText(emoji,posX,posY)
        });
    });
    //game.fillRect(0,0,100,100); //fillRect( xinicial, yinicial, width, height)
    //game.clearRect(0,0,10,100); //Borrar seccion del canvas

    //game.font="25px Verdana"    //Fuente de texto
    //game.fillStyle="red"        //Estilo de texto
    //game.textAlign="end"
    //game.fillText("Love",150,50)    //Insertar texto en canvas
    movePlayer()
}

//reiniciar Juego
NewGame.addEventListener("click",newGame)

function newGame(){
  level=0;
  lives=3
  clearInterval( timeInterval )
  timeStart = undefined
  playerPosition.x = undefined
  playerPosition.y = undefined
  startGame()

}
//Funcion nivel ganado

function levelWin(){
  // console.log("subiste de nivel")
  level++
  startGame()
}

function showCollision() {
  game.clearRect(0, 0, canvasSize, canvasSize);
  game.font = '10px Verdana';
  game.textAlign = 'center';
  if(lives > 1) {
      game.font = '20px Verdana';
      game.fillText('Perdiste una vida 💔', canvasSize/2, canvasSize/2);   
  }
  else {
      game.font = '20px Verdana';
      game.fillText('Perdiste todas las vidas 💀', canvasSize/2, canvasSize/2);
  } 
}

function gameWin(){
  console.log("Pasaste todos los niveles!!!")
  clearInterval(timeInterval)
  const recordTime= localStorage.getItem("record_time");
  const playerTime=formatTime(Date.now()-timeStart);

  if(recordTime){
    if(recordTime>=playerTime){
      localStorage.setItem("record_time",playerTime)
      pResult.innerHTML="Record superado"
    }else{
      pResult.innerHTML="No supero el record"
    }
  }else{
    localStorage.setItem("record_time",playerTime)
  }

  console.log({recordTime,playerTime})
}
function levelFail(){
  lives--;

  
  if(lives<=0){
    level=0
    lives=3;
    timeStart=undefined;
    // alert("Perdiste!!!")
  }
  playerPosition.x=undefined;
  playerPosition.y=undefined;
  startGame()

}

//funcion mostrar vidas
function showLifes(){
  //opcion 1-Llamar OBJ Array-- POO --insertamos items con .fill
  // const heartsArray=Array(lives).fill(emojis["HEART"])
  // spanLive.innerHTML = "";
  // heartsArray.forEach(heart => spanLives.append(heart));

  //opcion 2-Metodo Repeat
  spanLive.innerHTML = emojis["HEART"].repeat(lives)
}
//formato de tiempo
function formatTime(ms){
  const cs = parseInt(ms/10) % 100
  const seg = parseInt(ms/1000) % 60
  const min = parseInt(ms/60000) % 60
  const csStr = `${cs}`.padStart(2,"0")
  const segStr = `${seg}`.padStart(2,"0")
  const minStr = `${min}`.padStart(2,"0")
  return`${minStr}:${segStr}:${csStr}`
}

function showTime(){
  spanTime.innerHTML = formatTime(Date.now()-timeStart);
}

function showRecord(){
  spanRecord.innerHTML=localStorage.getItem("record_time")
}

//mover jugador
function movePlayer(){

  const giftColissionX=playerPosition.x.toFixed(3)==giftPosition.x.toFixed(3);
  const giftColissiony=playerPosition.y.toFixed(3)==giftPosition.y.toFixed(3);

  const giftColission= giftColissionX && giftColissiony;
   
  //validar colicion con regalo
  if(giftColission){
    // console.log("Colision con regalo detectada");
    levelWin()
  }

  const enemyColission=enemyPositions.find(enemy=>{
    const enemyColissionX=enemy.x.toFixed(3)==playerPosition.x.toFixed(3);
    const enemyColissionY=enemy.y.toFixed(3)==playerPosition.y.toFixed(3);
    return enemyColissionX && enemyColissionY;
  })

    //validar colicion con bombas
    if(enemyColission){
      // console.log("Colision con BOMBA detectada")
      showCollision()
      setTimeout(levelFail, 2000);
      emojis[PLAYER]=""
    }

    

  game.fillText(emojis["PLAYER"],playerPosition.x,playerPosition.y)
}


//MOVIMIENTO DE TECLAS

//Detecctar teclas presionadas
window.addEventListener("keydown",moveByKeys)

//Detectar click en botones
btnsUp.addEventListener("click",moveUp)
btnsLeft.addEventListener("click",moveLeft)
btnsRight.addEventListener("click",moveRight)
btnsDown.addEventListener("click",moveDown)


function moveByKeys(event){
    //return console.log(event) //leemos el evento (la tecla que se imprimio)
    if(event.key=="ArrowUp")moveUp();
    else if(event.key=="ArrowRight")moveRight();
    else if(event.key=="ArrowLeft")moveLeft();
    else if(event.key=="ArrowDown")moveDown();
}

function moveUp() {
    // console.log('Me quiero mover hacia arriba');
  
    if ((playerPosition.y - elementsSize) < elementsSize) {
      // console.log('OUT');
    } else {
      playerPosition.y -= elementsSize;
      startGame();
    }
  }
  function moveLeft() {
    // console.log('Me quiero mover hacia izquierda');
  
    if ((playerPosition.x - elementsSize) < elementsSize) {
      // console.log('OUT');
    } else {
      playerPosition.x -= elementsSize;
      startGame();
    }
  }
  function moveRight() {
    // console.log('Me quiero mover hacia derecha');
  
    if ((playerPosition.x + elementsSize) > canvasSize) {
      // console.log('OUT');
    } else {
      playerPosition.x += elementsSize;
      startGame();
    }
  }
  function moveDown() {
    // console.log('Me quiero mover hacia abajo');
    
    if ((playerPosition.y + elementsSize) > canvasSize) {
      // console.log('OUT');
    } else {
      playerPosition.y += elementsSize;
      startGame();
    }
  }
