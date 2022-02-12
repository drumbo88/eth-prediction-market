import { useState, useEffect } from 'react'
import getBlockchain from './ethereum';
import { Pie } from 'react-chartjs-2';

const SIDE = {
  BIDEN: 0,
  TRUMP: 1,
}

function App() {

  const [predictionMarket, setPredictionMarket] = useState(undefined)
  const [myBets, setMyBets] = useState(undefined)
  const [betPredictions, setBetPredictions] = useState(undefined)

  useEffect(() => { // (*)
    const init = async () => { // useEffect doesn't accept async callback (*), so we have to create it inside
      console.log("Iniciando...")
      getBlockchain().then(async (res) => {
        const { signerAddress, predictionMarket } = res

        const myBets = await Promise.all([
          predictionMarket.betsPerGambler(signerAddress, SIDE.BIDEN),
          predictionMarket.betsPerGambler(signerAddress, SIDE.TRUMP),
        ])
  
        const bets = await Promise.all([
          predictionMarket.bets(SIDE.BIDEN),
          predictionMarket.bets(SIDE.TRUMP),
        ])

        setBetPredictions({
          labels: ['Biden','Trump'],
          datasets: [{
            data: [bets[SIDE.BIDEN].toString(), bets[SIDE.TRUMP].toString()],
            backgroundColor: ['#36A2EB', '#FF6384'],
            hoverBackgroundColor: ['#36A2EB', '#FF6384'],
          }]
        })
  
        setPredictionMarket(predictionMarket)
        setMyBets(myBets)
      })
      .catch((error) => {
        setBetPredictions({})
        setPredictionMarket({})
        setMyBets({
          [SIDE.BIDEN]: 0,
          [SIDE.TRUMP]: 0,
        })
        return alert(error)
      })
    }
    init()
  }, []) // Only first load

  if (typeof predictionMarket === 'undefined' || typeof myBets === 'undefined' || typeof betPredictions === 'undefined')
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
  const WithdrawGain = () => (
    <div className='row'>
      <h2>Claim your gains, if any, after the election</h2>
      <button type="submit" className="btn btn-primary mb-2" onClick={e => withdrawGain()}>
        Claim 
      </button>
    </div>
  )
  const electionFinished = async () => {
    await predictionMarket.electionFinished()
  }
  const finishElection = async () => {
    await predictionMarket.reportResult()
  }
  const FinishElection = () => (
    <div className='row'>
      <h2>Finish election</h2>
      <button type="submit" className="btn btn-primary mb-2" onClick={e => finishElection()}>
        Finish election 
      </button>
    </div>
  )

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-sm-12'>
          <h1 className='text-center'>Prediction Market</h1>
          <div className='jumbotron'>
            <h1 className='display-4 text-center'>Who will win the US election?</h1>
            <p className='lead text-center'>Current odds</p>
            <div><Pie data={betPredictions} /></div>
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
                <input type='text' className='form-control mb-2 mr-sm-2' placeholder="Bet amount (wei)"></input>
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
                <input type='text' className='form-control mb-2 mr-sm-2' placeholder="Bet amount (wei)"></input>
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
      { electionFinished() ? <WithdrawGain /> : <FinishElection /> }
    </div>
  );
}

export default App;
