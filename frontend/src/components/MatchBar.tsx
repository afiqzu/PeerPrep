import React, {useEffect, useState} from 'react'
import '../styles/MatchBar.css'
import { Info, Star, Whatshot } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import MatchingScreen from './MatchingScreen.tsx'
import MatchingStatusBar from './MatchingStatusBar.tsx'
import { useSessionDetails } from '../stores/sessionStore.ts'
import { useUser } from '../stores/userStore.ts'
import {TimerProvider} from "./TimerProvider.tsx";
import MatchSuccess from "./MatchSuccess.tsx";
import { useCancelQueue, useJoinQueue } from '../stores/matchingStore.ts'
import type { Complexity } from '../api/questions.ts'

const tooltipDescription =
    'Select a difficulty level and get matched with another user. ' +
    'Together, you both will collaboratively attempt a question of the chosen difficulty.'
const MatchBar: React.FC = () => {
    const { data: sessionDetails } = useSessionDetails()
    const { data: user } = useUser(sessionDetails?.user_id)
    const joinQueueMutation = useJoinQueue()
    const cancelQueueMutation = useCancelQueue()
    const { isLoading: findMatch, isSuccess: matchSuccess } = joinQueueMutation

    const [difficulty, setDifficulty] = useState<Complexity>('Easy')
    const [isMatchingScreenVisible, setMatchingScreenVisible] = useState(false)
    const [isMatchingStatusBarVisible, setMatchingStatusBarVisible] = useState(false)
    const [secondsElapsed, setSecondsElapsed] = useState(0);

    useEffect(() => {
        if (findMatch) { // Assuming you want to start the timer when findMatch becomes true
            const timer = setTimeout(() => setSecondsElapsed(secondsElapsed + 1), 1000);
            return () => clearTimeout(timer); // Cleanup the timeout when component is unmounted or if findMatch becomes false
        }
        setMatchingScreenVisible(false)
        setMatchingStatusBarVisible(false)
    }, [findMatch, secondsElapsed]);

    const startFindMatch = (difficulty: Complexity) => {
        joinQueueMutation.mutateAsync(difficulty)
        setMatchingScreenVisible(true)
        setDifficulty(difficulty)
    }

    const stopFindMatch = () => {
        cancelQueueMutation.mutateAsync()
        setMatchingScreenVisible(false)
        setMatchingStatusBarVisible(false)
    }

    const handleMinimise = () => {
        setMatchingScreenVisible(false)
        setMatchingStatusBarVisible(true)
    }

    const handleMaximise = () => {
        setMatchingScreenVisible(true)
        setMatchingStatusBarVisible(false)
    }

    return (
        <TimerProvider>
            <span className='matchbar-container'>
                <div className='welcome'>
                    <h2>Welcome back, {user?.username}!</h2>
                </div>
                <div className='match'>
                    {!findMatch && (
                        <>
                            <div className='match-title'>
                                <h2>Find a Match</h2>
                                <Whatshot fontSize='large' />
                                <Tooltip title={tooltipDescription} style={{ fontSize: '1.5rem' }}>
                                    <Info style={{ opacity: '0.5', marginLeft: '0.5rem' }} />
                                </Tooltip>
                            </div>
                            <div className='match-button-container'>
                                <button
                                    className='match-button'
                                    id='easy'
                                    onClick={() => startFindMatch('Easy')}
                                >
                                    <div className='icon-text-wrapper'>
                                        <Star />
                                        Easy
                                    </div>
                                </button>
                                <button
                                    className='match-button'
                                    id='medium'
                                    onClick={() => startFindMatch('Medium')}
                                >
                                    <Star />
                                    <Star />
                                    Medium
                                </button>
                                <button
                                    className='match-button'
                                    id='hard'
                                    onClick={() => startFindMatch('Hard')}
                                >
                                    <Star />
                                    <Star />
                                    <Star />
                                    Hard
                                </button>
                            </div>
                        </>
                    )}
                    {isMatchingStatusBarVisible && (
                        <MatchingStatusBar
                            difficulty={difficulty}
                            onMatchExit={() => stopFindMatch()}
                            onMaximise={handleMaximise}
                        />
                    )}
                </div>
            </span>
            {isMatchingScreenVisible && (
                <MatchingScreen
                    difficulty={difficulty}
                    onMatchExit={() => stopFindMatch()}
                    onMinimise={handleMinimise}
                />
            )}
            {matchSuccess && <MatchSuccess />}
        </TimerProvider>
    )
}

export default MatchBar
