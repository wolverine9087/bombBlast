import clsx from "clsx"
import { useState } from "react"
import Confetti from "react-confetti"

function generateBomb(difficulty = "easy") {
  const bombCount = 
    difficulty === "easy" ? 3 :
    difficulty === "medium" ? 6 :
    difficulty === "hard" ? 8 : 12

  const bombIds = new Set()

  while (bombIds.size < bombCount) {
    bombIds.add(Math.floor(Math.random()*64))
  }

  return Array.from({length : 64}, (x,i) => ({
    id : i,
    isBomb: bombIds.has(i),
    isRevealed : false,
    isClicked : false
  }))
}

export default function App() {
  const [boxes, setBoxes] = useState(() => generateBomb())
  const [difficulty, setDifficulty] = useState("easy")
  const [rightClick, setRightClick] = useState(0)
  const [wrongClick, setWrongClick] = useState(0)
  const [powerUpUsed, setPowerUpUsed] = useState(false)
  const [powerUpActive, setPowerUpActive] = useState(false)

  const gameLost = wrongClick >= 3
  const gameWon = rightClick >= 58
  const gameOver = gameLost || gameWon

  function reStart(selectedDifficulty = difficulty){
    setRightClick(0)
    setWrongClick(0)
    setPowerUpUsed(false)
    setPowerUpActive(false)
    setBoxes(generateBomb(selectedDifficulty))
  }

  function revealColumn(i) {
    const column = i % 16
    setPowerUpUsed(true)
    setPowerUpActive(false)

    setBoxes(prev =>
      prev.map(box =>
        box.id % 16 === column
          ? { ...box, isRevealed: true }
          : box
      )
    )
  }

  function revelBox(i) {
    const clickedBox = boxes.find(box => box.id === i)

    if (clickedBox.isClicked){
      return
    }

    if (powerUpActive) {
      revealColumn(i)
      return
    }

    if(clickedBox.isBomb){
      setWrongClick(prev => prev + 1)
    }else{
      setRightClick(prev => prev + 1)
    }

    setBoxes(prev => 
      prev.map(box => 
        box.id === i ? {...box, isRevealed : true, isClicked : true} : box
      )
    )
  }
  
  const boxElement = boxes.map((x) => {
    const isRevealed = gameOver ? true : x.isRevealed;
    
    return(
    <button id={x.id} 
      key={x.id}
      onClick={() => revelBox(x.id)}
      disabled={gameOver}
      className={clsx("box" ,{"gem" : isRevealed && !x.isBomb, "bomb" : isRevealed && x.isBomb, "clicked" : x.isClicked})}
    ></button>)
  })

  function gameSatus() {
    if(gameWon){
      return(
        <>
         <h3>your won the game</h3>
         <p>congratulation 🥳</p>
         <p>score: {rightClick}</p>
        </>
      )
    }

    else if(gameLost){
      return(
        <>
         <h3>your lost the game</h3>
         <p>restart the game</p>
         <p>score: {rightClick}</p>
        </>
      )
    }

    else if(rightClick < 7 || rightClick + wrongClick < 1){
      return(
      <>
        <h3>your game stated</h3>
        <p>press any button</p>
        <p>score: {rightClick}</p>
      </>)
    }

    else if(rightClick >= 7 && rightClick <= 12 || rightClick + wrongClick < 1){
      return(
      <>
        <h3>good start</h3>
        <p>keep playing the rest</p>
        <p>score: {rightClick}</p>
      </>)
    }

    else if(wrongClick === 2){
      return (
        <>
         <h3>play carefully</h3>
         <p>you have only 1 live left</p>
         <p>score: {rightClick}</p>
        </>
      )
    }

    else if(rightClick > 12){
      return (
        <>
         <h3>you are doing great</h3>
         <p>well done, keep playing</p>
         <p>score: {rightClick}</p>
        </>
      )
    }

  }

  return (
    <main>
      {gameWon && <Confetti/>}
      <header>
        <h1>BlastBox</h1>
        <p>welcome to BlastBox. here are 64 number of boxes from each box containes treasures as much boxes you open you get all that treasure but be careful some of them are bombs! you have 3 lives.</p>
      </header>
      <section className="game-status">
        {gameSatus()}
      </section>
      <select 
        className="select"
        value={difficulty}
        onChange={(event) => {setDifficulty(event.target.value); reStart(event.target.value)}}
      >
        <option value="easy">easy</option>
        <option value="medium">medium</option>
        <option value="hard">hard</option>
        <option value="night-mare">night-mare</option>
      </select>
      <section  className="powerup">
        <button onClick={() => setPowerUpActive(true)} disabled={powerUpUsed || gameOver}>
          {powerUpActive ? "click a box column" : "use this to see any one column"}
        </button>
      </section>
      <section className="boxes">
        {boxElement}
      </section>
      {gameOver && <button onClick={() => reStart()} className="newGame">Restart Game</button>}
    </main>
  )
}
