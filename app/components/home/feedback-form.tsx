import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/lib/contexts/UserContext'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/contexts/TranslationContext'
import { t } from '@/lib/i18n/translations'
import { AuthModal } from '@/components/auth/AuthModal'

type Sentiment = 'very_positive' | 'positive' | 'negative' | 'very_negative' | 'null'

const emojis: { [key in Sentiment]: string } = {
  very_positive: '😀',
  positive: '🙂',
  negative: '🙁',
  very_negative: '😞',
  'null': ''
}

export default function FeedbackForm() {
  const { user } = useUser()
  const { currentLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [sentiment, setSentiment] = useState<Sentiment>('null')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async () => {
    if (!user?.id) {
      setShowAuthModal(true)
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.rpc('create_feedback', {
        p_sentiment: sentiment,
        p_message: feedback
      })

      if (error) throw error

      alert(t(currentLanguage, 'feedback_form.thanks'))
      setFeedback('')
      setSentiment('null')
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert(t(currentLanguage, 'feedback_form.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative" ref={formRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-jumbo-elements-textSecondary hover:text-jumbo-elements-textPrimary transition-colors text-xs font-medium bg-transparent"
      >
        {t(currentLanguage, 'feedback_form.button')}
      </button>
      {isOpen && (
        <div className="absolute bottom-8 right-0 w-80 bg-jumbo-elements-background dark:bg-gray-900 border border-jumbo-elements-borderColor shadow-lg translate-x-12 z-[60] rounded-md">
          <div className="p-4">
            <textarea
              placeholder={t(currentLanguage, 'feedback_form.placeholder')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] mb-4 text-xs w-full bg-jumbo-elements-bg-depth-1 dark:bg-gray-800 text-jumbo-elements-textPrimary p-2 rounded-md resize-none border border-jumbo-elements-borderColor"
            />
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {(Object.keys(emojis) as Sentiment[])
                  .filter(key => key !== 'null')
                  .map((key) => (
                    <button
                      key={key}
                      onClick={() => setSentiment(key)}
                      className={`text-lg p-1 ${sentiment === key ? 'bg-jumbo-elements-bg-depth-2 dark:bg-gray-700 rounded-md' : ''}`}
                    >
                      {emojis[key]}
                    </button>
                  ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!feedback.trim() || sentiment === 'null' || isSubmitting}
                className="px-3 py-1.5 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : t(currentLanguage, 'feedback_form.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="signin"
      />
    </div>
  )
}
