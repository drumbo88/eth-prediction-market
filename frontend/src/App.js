import { useState, useEffect } from 'react'
import getBlockchain from './ethereum';

const SIDE = {
  BIDEN: 0,
  TRUMP: 1,
}

function App() {

  const [predictionMarket, setPredictionMarket] = useState(undefined)
  const [myBets, setMyBets] = useState(undefined)

  useEffect(() => { // (*)
    const init = async () => { // useEffect doesn't accept async callback (*), so we have to create it inside
      const { signerAddress, predictionMarket } = await getBlockchain()
      const myBets = await Promise.all([
        predictionMarket.betsPerGambler(signerAddress, SIDE.BIDEN),
        predictionMarket.betsPerGambler(signerAddress, SIDE.TRUMP),
      ])
      setPredictionMarket(predictionMarket)
      setMyBets(myBets)
    }
  }, []) // Only first load

  if (typeof predictionMarket === 'undefined' || typeof myBets === 'undefined')
    return 'Loading...'

  const placeBet = async (side, e) => {
    e.preventDefault()
    await predictionMarket.placeBet(
      side, { value: e.target.form.elements[0].value }
    )
  }
  const withdrawGain = async () => {
    await predictionMarket.withdrawGain()
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-sm-12'>
          <h1 className='text-center'>Prediction Market</h1>
          <div className='jumbotron'>
            <h1 className='display-4 text-center'>Who will win the US election?</h1>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-sm-6'>
          <div className='card'>
            <img src='./img/trump.png' />
            <div className='card-body'>
              <h5 className='card-title'>Trump</h5>
              <form className='form-inline' onSubmit={e => placeBet(SIDE.TRUMP, e)}>
                <input type='text' className='form-control mb-2 mr-sm-2' placeholder="Bet amount (ether)"></input>
                <button type="submit" className="btn btn-promary mb-2">Submit</button>
              </form>
            </div>
          </div>
        </div>
        <div className='col-sm-6'>
          <div className='card'>
            <img src='./img/biden.png' />
            <div className='card-body'>
              <h5 className='card-title'>Biden</h5>
              <form className='form-inline' onSubmit={e => placeBet(SIDE.BIDEN, e)}>
                <input type='text' className='form-control mb-2 mr-sm-2' placeholder="Bet amount (ether)"></input>
                <button type="submit" className="btn btn-promary mb-2">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className='row'>
        <h2>Your bets</h2>
        <ul>
          <li>Biden: {myBets[SIDE.BIDEN].toString()} ETH (wei)</li>
          <li>Trump: {myBets[SIDE.TRUMP].toString()} ETH (wei)</li>
        </ul>
      </div>
      <div className='row'>
        <h2>Claim your gains, if any, after the election</h2>
        <button type="submit" className="btn btn-primary mb-2" onClick={e => withdrawGain()}>
          Submit 
        </button>
      </div>
    </div>
  );
}

export default App;
