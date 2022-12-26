import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex!).toString() as keyof typeof contractAddresses
    const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : undefined
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = ((await getEntranceFee()) as ethers.BigNumber).toString() as string
        const numPlayersFromCall = ((await getNumberOfPlayers()) as ethers.BigNumber).toString() as string
        const RecentWinnerFromCall = (await getRecentWinner()) as string

        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(RecentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx: ethers.ContractTransaction) {
        await tx.wait(1)
        handleNewNotification()
        updateUI()
    }

    const handleNewNotification = function (): void {
        dispatch({
            type: "info",
            message: "Trasnaction completed!",
            title: "tx notofication",
            position: "topR",
            icon: "bell",
        })
    }
    return (
        <div className="p-5 ">
            Hi from Lottery entrance
            {lotteryAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterLottery({
                                onSuccess: (tx) => handleSuccess(tx as ethers.ContractTransaction),
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div> : <div>Enter lottery</div>}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatEther(entranceFee)} ETH</div>
                    <div>Number of players: {numPlayers}</div>
                    <div>Recent winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No lottery address detected</div>
            )}
        </div>
    )
}
