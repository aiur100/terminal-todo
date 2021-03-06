const readline = require('readline');
const fs = require('fs');
const USER_PATH = process.env.HOME+"/.terminal-todo";
const dataFile = USER_PATH+"/todo.json";

/**
 * ----------------------------------------
 * Todo list functions - Start
 * ----------------------------------------
 */

/**
 * Save the todo list to 
 * a the todo.json file. 
 * 
 * @param {array} list 
 */
function saveList(list){
  if(!fs.existsSync(USER_PATH)){
    fs.mkdirSync(USER_PATH);
  }
  fs.writeFileSync(dataFile, JSON.stringify(list,null,2));
}

function printIt(message){
  process.stdout.write(`${message}`);
}

function printToDoList(list){
    list.forEach(element => {
      printIt(`[${element.done ? '\u2713' : " " }] ${element.task}\n`);
    });
}

function refreshAndPrintList(){
    readline.cursorTo(process.stdin, 0, 0, function(){
        readline.clearScreenDown(process.stdin);
        readline.cursorTo(process.stdin, 0, 1);  
        printToDoList(todo); 
    });
}

function consoleMessage(message,callback){
  readline.cursorTo(process.stdin, 0, 0, function(){
      readline.clearLine(process.stdin);
      printIt(`> ${message}`);
      callback();
  }); 
}
/**
 * ----------------------------------------
 * Todo list functions - End
 * ----------------------------------------
 */


/**
 * If the todo.json file is missing
 * create one. 
 */
if(!fs.existsSync(dataFile)){
  const temp = [];
  saveList(temp);
}

const todo  = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const minX  = 0;
const minY  = 1;
let maxY = todo.length;
let addMode = false;
const noTasks = "NO TASKS. PRESS + KEY TO ADD";

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

/**
 * The cursor object managing
 * user input navigate around the 
 * terminal screen
 */
const cursor = {
  x : 0,
  y : 1,
  getTodoElement: function(){
    return this.y - 1;
  }
};



if(todo.length > 0){
  refreshAndPrintList();
}
else{
  printIt(noTasks);
}

var addStore = [];

/**
 * The application flow is directed by 
 * user key entry, so all of the logic is here. 
 */
process.stdin.on('keypress', (str, key) => {
  /**
   * If the user selects add mode, 
   * then this is what is executed so that the
   * user input can be added as a todo item.
   */
  if(addMode && key.name !== "return"){

      if(process.stdout.columns - 5 <= addStore.length){
        return; 
      }

      if(key.name !== "backspace"){
        addStore.push(str);
      }
      else{
        addStore.pop();
      }

      readline.clearLine(process.stdin);
      readline.cursorTo(process.stdin, 0, cursor.y);
      printIt(addStore.join(""));
      readline.cursorTo(process.stdin, addStore.length, cursor.y);
      return;
  }//if Return is entered in addmode, we assume user is done inputing data.
  else if(addMode && key.name === "return"){
      todo.push({task: addStore.join(""),done: false});
      addStore = [];
      addMode = false;
      refreshAndPrintList();
      maxY = todo.length;
      saveList(todo);
      return;
  }
  else if(str === "-" && todo[ cursor.getTodoElement() ]){
    todo.splice(cursor.getTodoElement(),1);
    if(!todo.length > 0){
      refreshAndPrintList();
      printIt(noTasks);
    }
    else{
      refreshAndPrintList();
    }

    maxY = todo.length;
    saveList(todo);
    return;
  }

  if (key.ctrl && key.name === 'c'){
    process.exit();
  } 
  else if(key.name === "down" && cursor.y < maxY){
    cursor.y++;
  }
  else if(key.name === "up" && cursor.y > minY){
    cursor.y--;
  }
  else if(key.name === "left" && cursor.x > minX){    
    cursor.x--;
  }
  else if(key.name === "right"){
    cursor.x++;
  }
  else if(str === "+"){
    addMode = true;
    readline.cursorTo(process.stdin, 0, 0, function(){
        readline.clearScreenDown(process.stdin); 
        printIt("ADD TASK (Hit Return When Finished):\n");
    });
    return;
  }
  else if(key.name === "x" && cursor.x === 1 && todo[ cursor.getTodoElement() ]){
    todo[ cursor.getTodoElement() ].done = !todo[ cursor.getTodoElement() ].done;
    saveList(todo);
    refreshAndPrintList();
    return;
  }

  if(todo[ cursor.getTodoElement() ]){
    consoleMessage(`"+" Add, "-" Remove, "x" Done`,function(){
        readline.cursorTo(process.stdin, cursor.x, cursor.y);
    });
  }
});
