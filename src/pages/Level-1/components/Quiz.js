import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faTrophy,
  faStar,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { generateQuizQuestions, submitQuizResult, getQuizResults, getUser, getChallengeById, submitChallengeResult } from "../../../utils/apiServices";
import Loading from "../../../components/Loading";
import ErrorPage from "../../../components/ErrorPage";

const Quiz = () => {
  const { topic } = useParams();
  
  // Check if this is a challenge quiz
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = urlParams.get('challengeId') || sessionStorage.getItem('currentChallengeId');
  const projectTopic = urlParams.get('projectTopic');
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingResults, setIsSavingResults] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const handleSubmitQuizRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Generate quiz questions using backend API
  const generateQuizQuestionsFromAPI = async (topicName) => {
    try {
      const questions = await generateQuizQuestions(topicName, projectTopic);
      if (Array.isArray(questions) && questions.length > 0) {
        return questions;
      } else {
        throw new Error('No questions returned from API');
      }
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      toast.error(`Failed to generate questions: ${error.message}`);
      throw error;
    }
  };

  // Save quiz results to database with provided answers
  const saveQuizResultsWithAnswers = useCallback(async (answersToSave) => {
    const currentAnswers = answersToSave;
    const finalScore = currentAnswers.reduce((sum, answer) => sum + answer.points, 0);
    
    // Calculate time taken in MM:SS format
    const totalSeconds = questions.length * 30 - timeLeft;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeTaken = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    try {
      const uid = Cookies.get("uid");
      if (!uid) {
        throw new Error('User not authenticated');
      }

      // Get user data if not available
      let currentUserData = userData;
      if (!currentUserData) {
        currentUserData = await getUser(uid);
        setUserData(currentUserData);
      }
      
      if (currentAnswers.length > 0) {
        // Check if this is a challenge quiz
        if (challengeId) {
          // Submit to challenge endpoint
          const challengeResultData = {
            answers: currentAnswers,
            timeTaken: timeTaken
          };
          
          const challenge = await submitChallengeResult(challengeId, challengeResultData);
          // Challenge questions arrive without the answer key, so show the server's marking.
          const mine = challenge?.challengerId === uid ? challenge?.challengerResult : challenge?.opponentResult;
          if (Array.isArray(mine?.answers)) {
            setAnswers(mine.answers);
            setScore(mine.score || 0);
          }
          toast.success('Challenge results submitted successfully!');
          
          // Clear challenge ID from session storage
          sessionStorage.removeItem('currentChallengeId');
        } else {
          // Regular quiz submission
          const quizResultData = {
            answers: currentAnswers,
            timeLeft: timeLeft,
            timeTaken: timeTaken,
            subtopic: topic,
            role: "Level-1"
          };

          // Save quiz result via backend API
          await submitQuizResult(quizResultData);

          // Level-1 users don't get points/score updates - they only see results
          toast.success(`Quiz completed! Your score: ${finalScore}/${currentAnswers.length}`);
        }
      } else {
        throw new Error('No answers to save');
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      // Re-throw error so it can be handled by handleSubmitQuiz
      throw error;
    }
    }, [timeLeft, userData, topic, challengeId, questions.length]);

  // Submit quiz
  const handleSubmitQuiz = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Collect all answers including the current one
    let allAnswers = [...answers];
    
    // If there's a current question that hasn't been answered, add it to answers
    if (selectedAnswer && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const points = isCorrect ? 1 : 0;

      const answerData = {
        question: currentQuestion.question,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        points: points,
        isCorrect: isCorrect
      };

      allAnswers.push(answerData);
      setAnswers(allAnswers);
      setScore(prev => prev + points);
    }

    // Validate that we have answers before proceeding
    if (allAnswers.length === 0) {
      toast.error('No answers to submit. Please answer at least one question.');
      return;
    }

    // Validate that we have questions
    if (questions.length === 0) {
      toast.error('Quiz data is incomplete. Please try again.');
      return;
    }

    setIsSavingResults(true);

    try {
      // Save results first, then show results page
      await saveQuizResultsWithAnswers(allAnswers);
      // Only show results after successful save
      setShowResults(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      if (error.status === 429) {
        toast.error(error.message || 'Daily quiz limit reached. Come back tomorrow!', { autoClose: 5000 });
        navigate('/l1dashboard');
      } else {
        // Still show results for other errors
        setShowResults(true);
        toast.warning('Results displayed but may not have been saved. Please try again.');
      }
    } finally {
      setIsSavingResults(false);
    }
  }, [answers, selectedAnswer, currentQuestionIndex, questions, saveQuizResultsWithAnswers, navigate]);

  // Update ref whenever handleSubmitQuiz changes
  useEffect(() => {
    handleSubmitQuizRef.current = handleSubmitQuiz;
  }, [handleSubmitQuiz]);

  // Initialize quiz
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setIsLoading(true);
        
        // Get user data
        const uid = Cookies.get("uid");
        if (uid) {
          try {
            const userDataFromAPI = await getUser(uid);
            setUserData(userDataFromAPI);
          } catch (error) {
            console.error('Error fetching user data:', error);
          }

          // Check if user has already attempted this topic's quiz
          try {
            await getQuizResults({ subtopic: topic, role: 'Level-1' });
          } catch (error) {
            console.error('Error checking quiz attempts:', error);
          }
        }

        // Check if this is a challenge quiz
        if (challengeId) {
          // Fetch challenge and use its questions
          try {
            const challenge = await getChallengeById(challengeId);
            if (challenge && challenge.questions && Array.isArray(challenge.questions)) {
              setQuestions(challenge.questions);
            } else {
              throw new Error('Challenge questions not found');
            }
          } catch (error) {
            console.error('Error fetching challenge questions:', error);
            toast.error('Failed to load challenge questions');
            throw error;
          }
        } else {
          // Regular quiz - Generate questions via backend API
          const generatedQuestions = await generateQuizQuestionsFromAPI(topic);
          setQuestions(generatedQuestions);
        }
        
        // Set timer to 30 seconds per question
        setTimeLeft(30);
        
        // Start timer
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Time's up - auto submit
              if (handleSubmitQuizRef.current) {
                handleSubmitQuizRef.current();
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      } catch (error) {
        console.error('Error initializing quiz:', error);
        setError(error);
        toast.error(`Failed to load quiz: ${error.message}`);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeQuiz();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, navigate, challengeId]);

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      toast.warning('Please select an answer before proceeding');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const points = isCorrect ? 1 : 0;

    const answerData = {
      question: currentQuestion.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      points: points,
      isCorrect: isCorrect
    };

    setAnswers(prev => [...prev, answerData]);
    setScore(prev => prev + points);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer("");
      // Reset timer to 30 seconds for next question
      setTimeLeft(30);
      
      // Restart timer for next question
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            if (handleSubmitQuizRef.current) {
              handleSubmitQuizRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Quiz completed
      if (handleSubmitQuizRef.current) {
        handleSubmitQuizRef.current();
      }
    }
  };



  // Handle back to dashboard
  const handleBackToDashboard = () => {
    // For Level-1 users, navigate to Test Results page after quiz completion
    // so they can see their quiz performance
    if (showResults) {
      navigate('/l1dashboard/quiz-results');
    } else {
      navigate('/l1dashboard');
    }
  };

  // Show error page if there's an error and no questions
  if (error && questions.length === 0 && !isLoading) {
    return (
      <ErrorPage
        title="Failed to Load Quiz"
        message="We couldn't load the quiz questions. Please try again."
        error={error}
        onRetry={() => {
          setError(null);
          window.location.reload();
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <Loading 
        message={challengeId ? "Loading Challenge Quiz..." : "Generating Quiz..."}
        fullScreen={true}
      />
    );
  }

  if (showResults) {
    const hasAnswers = Array.isArray(answers) && answers.length > 0;
    const hasQuestions = Array.isArray(questions) && questions.length > 0;
    const totalQuestions = hasQuestions ? questions.length : 0;
    const correctAnswers = hasAnswers ? answers.filter(answer => answer.isCorrect).length : 0;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    if (isSavingResults) {
      return <Loading message="Finalizing Assessment..." fullScreen={true} />;
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 lg:p-12 font-['Inter']">
        <div className="max-w-4xl w-full">
          <div className="relative overflow-hidden bg-white  shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-line p-8 md:p-16">
            {/* Animated Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-navy-wash rounded-full blur-3xl opacity-50" />
            
            <div className="relative z-10 text-center mb-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-navy    mb-8 transform hover:rotate-12 transition-transform duration-500">
                <FontAwesomeIcon icon={faTrophy} className="text-4xl text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight mb-4">
                Assessment Complete
              </h1>
              <p className="text-ink-muted font-medium text-lg max-w-lg mx-auto">
                Comprehensive performance analysis for <span className="text-navy font-bold">"{topic}"</span> module.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-navy/5  blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 bg-navy-wash/50 border border-navy/15  text-center transform transition-transform group-hover:-translate-y-2">
                   <div className="text-3xl font-semibold text-blue-900 mb-1">{correctAnswers}/{totalQuestions}</div>
                   <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/60">Assessment Accuracy</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-600/5  blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 bg-emerald-50/50 border border-emerald-100  text-center transform transition-transform group-hover:-translate-y-2">
                   <div className="text-3xl font-semibold text-emerald-900 mb-1">{score}</div>
                   <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600/60">Performance Score</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-navy/5  blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 bg-navy-wash/50 border border-navy/15  text-center transform transition-transform group-hover:-translate-y-2">
                   <div className="text-3xl font-semibold text-purple-900 mb-1">{percentage}%</div>
                   <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/60">Academic Mastery</div>
                </div>
              </div>
            </div>

            {/* Answer Analytics */}
            <div className="space-y-4 mb-16">
               <div className="flex items-center justify-between px-4 mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">Detailed Feedback</h3>
                  <span className="px-3 py-1 bg-parchment rounded-full text-[10px] font-bold text-ink-muted">
                    {answers.length} Responses Captured
                  </span>
               </div>
               
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {answers.map((answer, index) => (
                    <div key={index} className={`grid grid-cols-[48px_1fr] gap-4 p-6  border transition-all ${
                      answer.isCorrect 
                        ? 'bg-white border-emerald-100 hover:border-emerald-300' 
                        : 'bg-white border-red-100 hover:border-red-300 shadow-sm'
                    }`}>
                      <div className={`w-12 h-12  flex items-center justify-center font-semibold ${
                        answer.isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-ink mb-3 leading-relaxed">
                          {answer.question}
                        </div>
                        <div className="flex flex-wrap gap-3">
                           <div className={`inline-flex items-center gap-2 px-3 py-1.5  text-[11px] font-bold ${
                             answer.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                           }`}>
                             <FontAwesomeIcon icon={answer.isCorrect ? faCheckCircle : faTimesCircle} />
                             {answer.userAnswer}
                           </div>
                           {!answer.isCorrect && (
                             <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-parchment text-ink-muted  text-[11px] font-bold border border-line">
                               <span className="opacity-50">Solution:</span> {answer.correctAnswer}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Sleek Navigation */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/l1dashboard/quiz-results')}
                className="flex-1 bg-navy hover:bg-navy-dark text-white px-10 py-6  font-semibold text-[11px] uppercase tracking-[0.2em]   transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                Analytics Repository
              </button>
              <button
                onClick={handleBackToDashboard}
                className="flex-1 bg-white hover:bg-parchment text-ink border-2 border-line px-10 py-6  font-semibold text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !isLoading) {
    return (
      <ErrorPage
        title="No Questions Available"
        message={`Unable to generate quiz questions for "${topic}".`}
        error="This might be due to API configuration, network issues, or topic format problems."
        onRetry={() => window.location.reload()}
        showHomeButton={true}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <ToastContainer autoClose={2000} />
      
      <div className="min-h-screen bg-parchment py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Premium Glass Header */}
          <div className="relative mb-10 overflow-hidden  bg-white/40  border border-white/60   p-8">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <FontAwesomeIcon icon={faUsers} className="text-8xl text-blue-900" />
             </div>

             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <button
                    onClick={handleBackToDashboard}
                    className="group inline-flex items-center gap-2 px-4 py-2 bg-navy/5 hover:bg-navy/10 text-ink-muted font-semibold text-[10px] uppercase tracking-[0.14em]  transition-all active:scale-95"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Hub
                  </button>
                  <div>
                    <h1 className="text-3xl font-semibold text-ink tracking-tight leading-none mb-2">Academic Assessment</h1>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-navy animate-pulse" />
                       Topic: {topic}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className={`flex flex-col items-center justify-center min-w-[100px] p-4  transition-all duration-500 border-2  ${
                    timeLeft <= 10 
                      ? "bg-red-50 border-red-200 text-red-600 animate-[pulse_1s_infinite]" 
                      : "bg-white border-blue-50 text-ink"
                  }`}>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-60 mb-1">Time Remaining</span>
                    <div className="flex items-center gap-2">
                       <FontAwesomeIcon icon={faClock} className={timeLeft <= 10 ? "text-red-500" : "text-navy"} />
                       <span className="font-mono text-3xl font-semibold">{formatTime(timeLeft)}</span>
                    </div>
                  </div>

                  <div className="bg-navy text-white px-8 py-4  flex flex-col items-center justify-center  ">
                     <span className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-40 mb-1">Progress</span>
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold">{currentQuestionIndex + 1}</span>
                        <span className="text-xs font-bold opacity-40">/</span>
                        <span className="text-xs font-bold opacity-40">{questions.length}</span>
                     </div>
                  </div>
                </div>
             </div>

             {/* Refined Progress Bar */}
             <div className="mt-8 relative h-1.5 w-full bg-parchment rounded-full overflow-hidden border border-line">
               <div
                 className="absolute top-0 left-0 h-full bg-navy transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                 style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
               />
             </div>
          </div>

          {/* Premium Question Card */}
          <div className="relative group perspective-1000">
            <div className="absolute -inset-1 bg-navy  blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-white    border border-line p-8 sm:p-12 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
              <div className="absolute top-0 left-0 w-2 h-full bg-navy" />
              
              <div className="mb-12">
                 <span className="inline-block px-3 py-1 bg-navy-wash text-navy font-semibold text-[9px] uppercase tracking-[0.14em]  mb-6 border border-navy/15/50">
                    Active Question
                 </span>
                 <h2 className="text-2xl sm:text-3xl font-semibold text-ink leading-[1.2] tracking-tight">
                   {currentQuestion.question}
                 </h2>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`relative w-full p-6 text-left  border-2 transition-all duration-500 flex items-center justify-between group/opt ${
                      selectedAnswer === option
                        ? 'border-blue-600 bg-navy-wash/50   translate-x-1'
                        : 'border-line bg-parchment/30 hover:border-line hover:bg-white hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-8 h-8  flex items-center justify-center text-xs font-semibold transition-all duration-500  ${
                        selectedAnswer === option
                          ? 'bg-navy text-white scale-110 rotate-12'
                          : 'bg-white text-ink-muted group-hover/opt:text-navy'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className={`text-base font-bold transition-colors duration-300 ${
                        selectedAnswer === option ? 'text-blue-900' : 'text-ink-muted'
                      }`}>{option}</span>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      selectedAnswer === option
                        ? 'bg-navy border-blue-600 scale-100'
                        : 'border-line bg-white scale-0'
                    }`}>
                       <FontAwesomeIcon icon={faCheckCircle} className="text-white text-[10px]" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-12 flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {questions.map((_, i) => (
                       <div key={i} className={`w-2 h-2 rounded-full border border-white ${
                          i === currentQuestionIndex ? "bg-navy w-6" : i < currentQuestionIndex ? "bg-emerald-400" : "bg-slate-200"
                       } transition-all duration-500`} />
                    ))}
                 </div>

                 <button
                   onClick={handleNextQuestion}
                   disabled={!selectedAnswer}
                   className={`group relative overflow-hidden px-10 py-5  font-semibold text-[11px] uppercase tracking-[0.2em] transition-all duration-500 ${
                     selectedAnswer
                       ? 'bg-navy text-white   hover:bg-navy-dark active:scale-95'
                       : 'bg-parchment text-ink-muted cursor-not-allowed opacity-50'
                   }`}
                 >
                   <div className="relative z-10 flex items-center gap-3">
                      {currentQuestionIndex < questions.length - 1 ? 'Next Sequence' : 'Submit Finalized Results'}
                      <FontAwesomeIcon icon={faStar} className={`transition-transform duration-500 ${selectedAnswer ? "group-hover:rotate-12 group-hover:scale-125" : ""}`} />
                   </div>
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Quiz;
