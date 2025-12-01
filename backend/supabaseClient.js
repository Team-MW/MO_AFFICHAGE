import { createClient } from '@supabase/supabase-js';

// ⚠️ Clé directement dans le code pour simplifier (clé publishable / anon côté client)
const supabaseUrl = 'https://nabqjzixfjkcwlsqcqwa.supabase.co';
const supabaseKey = 'sb_publishable_-3kGjr-T3ux-WDN98zBnWw_HyY3KYXK';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ➕ Ajouter un client dans la table "client"
export async function ajouterClient(nom) {
  const { data, error } = await supabase
    .from('client')
    .insert([{ nom }])
    .select()
    .single();

  if (error) {
    console.error('Erreur dans ajouterClient:', error);
    throw error;
  }

  return data;
}

// 📋 Lister tous les clients de la table "client"
export async function listerClients() {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erreur dans listerClients:', error);
    throw error;
  }

  return data;
}

// 📥 Récupérer le dernier compteur enregistré
export async function getLastCountFromDb() {
  const { data, error } = await supabase
    .from('client')
    .select('nom, id')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erreur dans getLastCountFromDb:', error);
    throw error;
  }

  if (!data || !data.nom) {
    return 0;
  }

  const parsed = parseInt(data.nom, 10);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

// 💾 Enregistrer la valeur actuelle du compteur
export async function saveCountToDb(value) {
  const valueAsString = value.toString();

  const { error } = await supabase
    .from('client')
    .insert([{ nom: valueAsString }]);

  if (error) {
    console.error('Erreur dans saveCountToDb:', error);
    throw error;
  }
}
