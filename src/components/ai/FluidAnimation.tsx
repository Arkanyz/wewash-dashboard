import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface FluidAnimationProps {
  onQuickAction: (action: string) => void;
  onStartChat: () => void;
}

const FluidAnimation: React.FC<FluidAnimationProps> = ({ onQuickAction, onStartChat }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('first_name, full_name, username')
            .eq('id', user.id)
            .single();
          
          console.log('Profile data:', profile);
          console.log('Profile error:', error);
          
          if (profile?.first_name) {
            setFirstName(profile.first_name);
          } else if (profile?.full_name) {
            setFirstName(profile.full_name.split(' ')[0]);
          } else if (profile?.username) {
            setFirstName(profile.username);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = canvasRef.current.offsetHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.3;

    interface Point {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      phase: number;
      baseDistance: number; // Distance initiale du centre
    }

    const spacing = 6;
    const points: Point[] = [];

    // Créer une grille sphérique de points
    for (let x = -baseRadius; x <= baseRadius; x += spacing) {
      for (let y = -baseRadius; y <= baseRadius; y += spacing) {
        const distanceFromCenter = Math.sqrt(x * x + y * y);
        if (distanceFromCenter <= baseRadius) {
          const z = Math.sqrt(Math.max(0, baseRadius * baseRadius - x * x - y * y));
          const normalizedZ = z / baseRadius;
          
          const baseOpacity = 0.2 + normalizedZ * 0.8;
          
          points.push({
            baseX: x,
            baseY: y,
            x: 0,
            y: 0,
            size: 1.2 + normalizedZ * 0.8,
            opacity: baseOpacity,
            speed: 0.8 + Math.random() * 0.4,
            phase: Math.random() * Math.PI * 2,
            baseDistance: distanceFromCenter // Stocker la distance initiale
          });
        }
      }
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      // Effet de pulsation
      const pulseFactor = 1 + Math.sin(time * 1.2) * 0.1; // Pulsation plus rapide (0.8 -> 1.2)
      const currentRadius = baseRadius * pulseFactor;

      const globalRotationX = Math.sin(time * 0.5) * 0.3;
      const globalRotationY = Math.cos(time * 0.4) * 0.3;

      points.forEach(point => {
        // Ajuster la position en fonction de la pulsation
        const scaledX = point.baseX * pulseFactor;
        const scaledY = point.baseY * pulseFactor;
        const scaledDistance = point.baseDistance * pulseFactor;

        // Calculer la nouvelle hauteur Z avec le rayon pulsé
        const z = Math.sqrt(Math.max(0, currentRadius * currentRadius - scaledX * scaledX - scaledY * scaledY));

        // Appliquer les rotations
        const rotatedX = scaledX * Math.cos(globalRotationY) + z * Math.sin(globalRotationY);
        const rotatedY = scaledY * Math.cos(globalRotationX) + z * Math.sin(globalRotationX);
        const rotatedZ = z * Math.cos(globalRotationY) * Math.cos(globalRotationX) - 
                        scaledX * Math.sin(globalRotationY) - 
                        scaledY * Math.sin(globalRotationX);

        // Ajouter un mouvement ondulant qui suit la pulsation
        const wave = Math.sin(time * point.speed + point.phase) * 3 * pulseFactor;
        
        point.x = centerX + rotatedX + wave;
        point.y = centerY + rotatedY + wave;

        // Ajuster l'opacité en fonction de la position Z et de la pulsation
        const normalizedZ = (rotatedZ + currentRadius) / (currentRadius * 2);
        const pulseOpacity = point.opacity * (0.3 + normalizedZ * 0.7);
        const dynamicOpacity = pulseOpacity * (0.8 + Math.sin(time * 2.5) * 0.2); // Variation d'opacité plus rapide

        // Ajuster la taille des points avec la pulsation
        const pulseSize = point.size * pulseFactor;

        ctx.beginPath();
        ctx.arc(point.x, point.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 170, 230, ${dynamicOpacity})`; // Bleu plus vif
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  const handleQuickAction = (action: string) => {
    onQuickAction(action);
  };

  return (
    <div 
      className="flex flex-col h-full relative"
      style={{
        background: `linear-gradient(180deg, 
          #C7D7F1 0%, 
          #CDDCF2 20%, 
          #D3DFF4 40%, 
          #D8E4F4 60%, 
          #E3EBF8 80%, 
          #EAF1FB 100%
        )`,
        minHeight: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Welcome Message */}
      <div className="relative z-10 text-center py-6 px-8 max-w-full">
        <h2 className="text-xl font-bold mb-2 text-gray-800 truncate">Assistant IA</h2>
        <p className="text-base text-gray-600 whitespace-normal break-words">
          Bonjour, {firstName || 'utilisateur'} ! Comment puis-je vous aider ?
        </p>
      </div>

      {/* Fluid Animation */}
      <div className="flex-grow relative" style={{ minHeight: '180px' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'blur(1px)' }}
        />
      </div>

      {/* Interactive Buttons */}
      <div className="relative z-10 flex flex-col items-center gap-3 mb-6">
        {/* First row of buttons */}
        <div className="flex justify-center gap-3 w-full max-w-[340px] px-4">
          <button 
            className="flex-1 px-5 py-2 bg-white/50 text-gray-800 rounded-full hover:bg-white/70 transition-colors shadow-md text-center"
            onClick={() => handleQuickAction('recommendations')}
          >
            Actions Recommandées
          </button>
          <button 
            className="flex-1 px-5 py-2 bg-white/50 text-gray-800 rounded-full hover:bg-white/70 transition-colors shadow-md text-center"
            onClick={() => handleQuickAction('optimization')}
          >
            Optimisation des Performances
          </button>
        </div>
        {/* Second row of buttons */}
        <div className="flex justify-center gap-3 w-full max-w-[340px] px-4">
          <button 
            className="flex-1 px-5 py-2 bg-white/50 text-gray-800 rounded-full hover:bg-white/70 transition-colors shadow-md text-center"
            onClick={() => handleQuickAction('history')}
          >
            Historique & Analyse
          </button>
          <button 
            className="flex-1 px-5 py-2 bg-white/50 text-gray-800 rounded-full hover:bg-white/70 transition-colors shadow-md text-center"
            onClick={() => handleQuickAction('intervention')}
          >
            Intervention Rapide
          </button>
        </div>
      </div>

      {/* Voice Button */}
      <div className="px-4 pb-4">
        <button 
          className="w-full h-[50px] bg-black hover:bg-[#1c3a5f] text-white rounded-[25px] flex items-center justify-center gap-2 transition-colors duration-300 font-bold shadow-lg"
          onClick={onStartChat}
        >
          <span>Message Assistant IA</span>
          <Mic className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FluidAnimation;
