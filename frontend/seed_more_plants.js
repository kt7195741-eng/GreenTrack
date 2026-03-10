const newPlantTypes = [
    { name: 'Fern', turkish: 'Eğrelti Otu' },
    { name: 'Bird of Paradise', turkish: 'Cennet Kuşu Çiçeği' },
    { name: 'String of Pearls', turkish: 'İnci Kolyesi' },
    { name: 'String of Hearts', turkish: 'Kalp Kalbe Karşı' },
    { name: 'Money Tree', turkish: 'Para Ağacı' },
    { name: 'Rubber Plant', turkish: 'Kauçuk Ağacı' },
    { name: 'Lithops', turkish: 'Yaşayan Taşlar' },
    { name: 'Echeveria', turkish: 'Eçeverya' },
    { name: 'Haworthia', turkish: 'Yılan Derisi Çiçeği' },
    { name: 'Sedum', turkish: 'Damkoruğu' },
    { name: 'Pilea', turkish: 'Pilea' },
    { name: 'Zamioculcas', turkish: 'Zeze Çiçeği' },
    { name: 'Maranta', turkish: 'Dua Çiçeği' },
    { name: 'Stromanthe', turkish: 'Stromante' },
    { name: 'Alocasia', turkish: 'Fil Kulağı' },
    { name: 'Colocasia', turkish: 'Kolokazya' },
    { name: 'Caladium', turkish: 'Kaladyum' },
    { name: 'Polyscias', turkish: 'Aralya' },
    { name: 'Schefflera', turkish: 'Şeflera' },
    { name: 'Nephrolepis', turkish: 'Aşk Merdiveni' },
    { name: 'Asplenium', turkish: 'Kuş Yuvası Eğreltisi' },
    { name: 'Platycerium', turkish: 'Geyik Boynuzu Eğreltisi' },
    { name: 'Adiantum', turkish: 'Venüs Saçı' },
    { name: 'Pteris', turkish: 'Pteris' },
    { name: 'Blechnum', turkish: 'Blechnum' },
    { name: 'Cycas', turkish: 'Sago Palmiyesi' },
    { name: 'Rhapis', turkish: 'Bambu Palmiyesi' },
    { name: 'Howea', turkish: 'Kentia Palmiyesi' },
    { name: 'Phoenix', turkish: 'Hurma Palmiyesi' },
    { name: 'Washingtonia', turkish: 'Washington Palmiyesi' },
    { name: 'Caryota', turkish: 'Balık Kuyruğu Palmiyesi' },
    { name: 'Musa', turkish: 'Muz Ağacı' },
    { name: 'Strelitzia', turkish: 'Starliçe' },
    { name: 'Heliconia', turkish: 'Helikonya' },
    { name: 'Canna', turkish: 'Tesbih Çiçeği' },
    { name: 'Zingiber', turkish: 'Zencefil' },
    { name: 'Curcuma', turkish: 'Zerdeçal' },
    { name: 'Alpinia', turkish: 'Alpinya' },
    { name: 'Costus', turkish: 'Kostus' },
    { name: 'Calathea Makoyana', turkish: 'Tavus Kuşu Çiçeği' },
    { name: 'Ctenanthe', turkish: 'Ctenanthe' },
    { name: 'Oxalis', turkish: 'Uyku Çiçeği' },
    { name: 'Senecio', turkish: 'İnci Tanesi' },
    { name: 'Ceropegia', turkish: 'Kalp Kalbe' },
    { name: 'Dischidia', turkish: 'Karınca Bitkisi' },
    { name: 'Aeschynanthus', turkish: 'Ruj Çiçeği' },
    { name: 'Columnea', turkish: 'Japon Balığı Çiçeği' },
    { name: 'Episcia', turkish: 'Episcia' },
    { name: 'Streptocarpus', turkish: 'Streptocarpus' },
    { name: 'Sinningia', turkish: 'Bardak Menekşesi' },
    { name: 'Primula', turkish: 'Çuha Çiçeği' },
    { name: 'Viola', turkish: 'Hercai Menekşe' },
    { name: 'Petunia', turkish: 'Petunya' },
    { name: 'Pelargonium', turkish: 'Sakız Sardunya' },
    { name: 'Fuchsia', turkish: 'Küpe Çiçeği' },
    { name: 'Impatiens', turkish: 'Cam Güzeli' },
    { name: 'Begonia Maculata', turkish: 'Çilli Begonya' },
    { name: 'Pachypodium', turkish: 'Madagaskar Palmiyesi' },
    { name: 'Adenium', turkish: 'Çöl Gülü' },
    { name: 'Hoya', turkish: 'Hoya Çiçeği' },
    { name: 'Araucaria', turkish: 'Salon Çamı' },
    { name: 'Pachira', turkish: 'Para Ağacı' },
    { name: 'Rhoeo', turkish: 'Musa’nın Beşiği' },
    { name: 'Coleus', turkish: 'Kolyos' },
    { name: 'Iresine', turkish: 'Kırmızı Yapraklı Kan Çiçeği' },
    { name: 'Gynura', turkish: 'Kadife Çiçeği' },
    { name: 'Hemigraphis', turkish: 'Mor İnci' }
];

async function seedPlants() {
    let success = 0;
    let exists = 0;
    let failed = 0;

    console.log(`Starting to seed ${newPlantTypes.length} plant types...`);

    for (const p of newPlantTypes) {
        try {
            const resp = await fetch('http://localhost:8080/api/plant-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: p.name, description: 'Added from bulk script' })
            });

            if (resp.ok) {
                console.log(`✅ Added: ${p.name}`);
                success++;
            } else {
                const text = await resp.text();
                if (text.includes("already exists")) {
                    console.log(`⏩ Exists: ${p.name}`);
                    exists++;
                } else {
                    console.log(`❌ Failed: ${p.name} - ${text}`);
                    failed++;
                }
            }
        } catch (e) {
            console.log(`❌ Error: ${p.name} - ${e.message}`);
            failed++;
        }
    }

    console.log(`Finished: ${success} added, ${exists} existed, ${failed} failed.`);
}

seedPlants();
