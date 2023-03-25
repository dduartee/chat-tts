import { useEffect, useState } from 'react'



const getVoices = async (synth: SpeechSynthesis) => {
  return new Promise<SpeechSynthesisVoice[]>((resolve, reject) => {
    let voices = synth.getVoices()
    if (voices.length !== 0) {
      resolve(voices)
    } else {
      synth.onvoiceschanged = () => {
        voices = synth.getVoices()
        resolve(voices)
      }
    }
  })
}
export default function Home() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [text, setText] = useState<string>('');
  useEffect(() => {
    getVoices(window.speechSynthesis).then((voices) => {
      setVoices(voices)
    })
  }, [])

  const falar = () => {
    const espanhol = voices.find((voice) => voice.lang === 'es-ES')
    if (!espanhol) return console.error('Não foi encontrado o espanhol')
    const fala = new SpeechSynthesisUtterance(text)
    fala.voice = espanhol
    window.speechSynthesis.speak(fala);
  }
  return (
    <div>
      <input type="text" placeholder='Digite algo' onChange={(e) => setText(e.target.value)} />
      <button
      disabled={voices.length === 0}
      onClick={falar}
      >
        Falar
      </button>
    </div>
  )
}
