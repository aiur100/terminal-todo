const readline    = require('readline');
const fs          = require('fs');
const dataFile    = "todo.json";


const cursor = 
{
    x : 0,
    y : 1
};

if(!fs.existsSync(dataFile))
{
  const temp = [];
  saveList(temp);
}

const todo  = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const minX  = 0;
const minY  = 1;
let maxY    = todo.length;
let addMode = false;

readline.emitKeypressEvents(process.stdin);

process.stdin.setRawMode(true);

const printIt = function (message)
{
    process.stdout.write(`${message}`);
}

function saveList(list)
{
  fs.writeFileSync(dataFile, JSON.stringify(list,null,2));
}

function printToDoList(list)
{
    list.forEach(element => 
    {
      printIt(`[${element.done ? "X" : " " }] ${element.task}\n`);
    });
}

function refreshAndPrintList()
{
    readline.cursorTo(process.stdin, 0, 0, function()
    {
        readline.clearScreenDown(process.stdin);
        readline.cursorTo(process.stdin, 0, 1);  
        printToDoList(todo); 
    });
}

if(todo.length > 0)
{
  refreshAndPrintList();
}
else
{
  printIt("NO TASKS. PRESS + KEY TO ADD");
}

function consoleMessage(message,callback)
{
    readline.cursorTo(process.stdin, 0, 0, function()
    {
        printIt(`TODO> ${message}               \r`);
        callback();
    }); 
}

var addStore = [];

process.stdin.on('keypress', (str, key) => 
{ 
  let printScreen = true;

  if(addMode && key.name !== "return")
  {
      if(key.name !== "backspace")
      {
        addStore.push(str);
      }
      else
      {
        addStore.pop();
      }
      readline.clearLine(process.stdin);
      readline.cursorTo(process.stdin, 0, cursor.y);
      printIt(addStore.join(""));
      readline.cursorTo(process.stdin, addStore.length, cursor.y);
      return;
  }
  else if(addMode && key.name === "return")
  {
    todo.push({task: addStore.join(""),done: false});
    addStore = [];
    addMode = false;
    refreshAndPrintList();
    maxY = todo.length;
    saveList(todo);
    return;
  }
  else if(str === "-")
  {
    todo.splice(cursor.y - 1,1);
    if(!todo.length > 0)
    {
      refreshAndPrintList();
      printIt("NO TASKS. PRESS + KEY TO ADD");
    }
    else
    {
      refreshAndPrintList();
    }
    maxY = todo.length;
    saveList(todo);
    return;
  }

  if (key.ctrl && key.name === 'c') 
  {
    process.exit();
  } 
  else if(key.name === "down" && cursor.y < maxY)
  {
    cursor.y++;
  }
  else if(key.name === "up" && cursor.y > minY)
  {
    cursor.y--;
  }
  else if(key.name === "left" && cursor.x > minX)
  {    
    cursor.x--;
  }
  else if(key.name === "right")
  {
    cursor.x++;
  }
  else if(str === "+")
  {
    addMode = true;
    readline.cursorTo(process.stdin, 0, 0, function()
    {
        readline.clearScreenDown(process.stdin); 
        printIt("ADD TASK (Hit Return When Finished):\n");
    });
    return;
  }
  else if(key.name === "x" && cursor.x === 1 && todo[cursor.y - 1])
  {
    todo[cursor.y - 1].done = !todo[cursor.y - 1].done;
    printScreen = false;
    saveList(todo);
    refreshAndPrintList();
  }
  if(printScreen && todo[cursor.y - 1])
  {
    consoleMessage(`TASK: ${todo[cursor.y - 1].task} | Commands: "+" - Add task, "-" remove task, "x" mark task done        `,function()
    {
        readline.cursorTo(process.stdin, cursor.x, cursor.y);
    });
  }
});
