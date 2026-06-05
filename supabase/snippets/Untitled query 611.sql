-- Créer le bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('expertise-documents', 'expertise-documents', true);

-- Politique UNIQUE qui permet TOUT à TOUT LE MONDE (lecture + écriture)
CREATE POLICY "Politique unique expertise bucket"
ON storage.objects
FOR ALL
USING (bucket_id = 'expertise-documents')
WITH CHECK (bucket_id = 'expertise-documents');