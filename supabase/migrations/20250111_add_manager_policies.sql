-- Ajout de politiques pour permettre aux managers de gérer leurs laveries
CREATE POLICY "Les managers peuvent ajouter leurs propres laveries"
    ON public.laundries
    FOR INSERT
    WITH CHECK (
        auth.uid() = manager_id
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'manager'
        )
    );

CREATE POLICY "Les managers peuvent modifier leurs propres laveries"
    ON public.laundries
    FOR UPDATE
    USING (
        auth.uid() = manager_id
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'manager'
        )
    );

CREATE POLICY "Les managers peuvent supprimer leurs propres laveries"
    ON public.laundries
    FOR DELETE
    USING (
        auth.uid() = manager_id
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'manager'
        )
    );
