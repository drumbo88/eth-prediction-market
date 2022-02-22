import { ethers, Contract } from 'ethers'
import PredictionMarket from './contracts/PredictionMarket.json'

const getBlockchain = () => new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
        if (!window.ethereum) 
            return reject("No se encontró wallet.")
        if (!window.ethereum.networkVersion) 
            return reject("Error metamask desconocido.")

        if (!PredictionMarket.networks.hasOwnProperty(window.ethereum.networkVersion))
            return reject("La red seleccionada es inválida (debe ser #"+window.ethereum.networkVersion+")")

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
        }
        catch (error) {
            return reject("Debes permitir el acceso a tu wallet. "+error);
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()

        const predictionMarket = new Contract(
            PredictionMarket.networks[window.ethereum.networkVersion].address,
            PredictionMarket.abi,
            signer
        )

        resolve({ signerAddress, predictionMarket })
    })
})

export default getBlockchain