import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ThemeToggle } from '../ui/theme-toggle'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../ui/use-toast'

export function Settings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userPreferences, setUserPreferences] = useState<any>(null)

  useEffect(() => {
    loadUserPreferences()
  }, [])

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        setUserPreferences(preferences)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const savePreferences = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            ...userPreferences,
            user_id: user.id,
            updated_at: new Date().toISOString()
          })

        if (error) throw error

        toast({
          title: "Préférences sauvegardées",
          description: "Vos paramètres ont été mis à jour avec succès.",
        })
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des paramètres.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Paramètres</h2>
        <Button onClick={savePreferences} disabled={loading}>
          {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Section Thème */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Apparence</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium">Thème</p>
              <p className="text-sm text-muted-foreground">
                Choisissez entre le mode clair et sombre
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Section Notifications */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          {/* Ajoutez ici les paramètres de notification */}
        </div>

        {/* Section Sécurité */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sécurité</h3>
          {/* Ajoutez ici les paramètres de sécurité */}
        </div>
      </div>
    </div>
  )
}
