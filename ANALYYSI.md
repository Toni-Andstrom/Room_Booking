1. Mitä tekoäly teki hyvin?

Kysyin tekoälyltä miten toteuttaisin asioita joita koin hyviksi lisäyksiksi ja se tuotti minulle luomansa pohja perusteelta ehdotuksia ja korvasi vanhan koodin uudella mihin oli lisännyt pyydetyt muutokset. Tämän lisäksi tekoäly ehdotti minulle muita parannusehdotuksia joista päädyinkin käyttämäään muutamia.

2. Mitä tekoäly teki huonosti?

Joskus tekoäly lisäsi jotain mitä en pyytänyt kuten ylimääräisiä listoja ennen itse varauskalenteria ja aina kuin tein varauksen niin se työnsi itse varauskalenteria alemmaksi. Jouduin poistamaan manuaalisti joitain kohtia jotta käyttöliittymä olisi parempi. Joskus muutos muutti enemmän kun mitä olin pyytänyt niin palasin takaisin edelliseen versioon ja yritin uudestaan.

3. Mitkä olivat tärkeimmät parannukset, jotka teit tekoälyn tuottamaan koodiin ja miksi?

Yritin tehdä ajanvarausjärjestelmästä mahdollisimman simpplelin ilman mitään ylimääräistä käyttöliittymässä. Aluksi tekoäly loi lomakkeen minkä inputteja täyttämällä varaus luotiin. Jokainen varaus tuli myös näkyviin listana varausjärjestyksessä uusin ylimpänä. Tämä oli mielestäni jotenkin epäselvä kun vaihtoehtoina oli useita huoneita varattavaksi joten päädyin siihen että ajan voisi varata suoraan taulukosta ja että ajat olisivat suoraan 30min pituisia, sillä tekoälyn alunperin tekemässä pohjassa olisi voinut itse määrittää ajan pituuden. Siitä ei olisi tullut mitään.

Lisäsin myös värit soluille rippuen oliko aika vapaa, varattu, mennyt, tai valittu ja lisäsin myös inputin varaajan nimelle. Nimi tulee näkyviin soluun varauksen jälkeen. Varausta ei voi tehdä ellei nimi ole kirjoitettu tai päivämäärä valittu. Ajan voi valita kun päivämäärä on valittu mutta varausnappi aktivoituu vasta kun aika on valittuna taulukosta ja tiedossa on nimi ja päivämäärä.


Tämän jälkeen lisäsin kyvyn varata ja poistaa useamman varauksen kerralla. Lisäsin myös varauksen poistamiselle oman napin mikä mielestäni selkeytti käyttöliittymää. Jos haluaa poistaa varauksen/varauksia niin täytyy ensin lisätä varauksen tekijän nimi nimikenttään. Tämä aktivoi varauksen tekijän varaukset kyseiseltä päivältä ja poistettavat varaukset voi valita suoraan taulukosta jonka jälkeen täytyy vai painaa "Poista valitut omat varaukset"-nappi viimeistelläksesi varauksen peruutus. Lisäsin myös ominaisuuden että nimikenttä tyhjenee varauksen tai varauksen poiston jälkeen.

Koska en ollut varma ymmärtävätkö käyttäjät miten varauksen poisto toimii, niin lisäsin tooltip "vinkin" "Poista valitut omat varaukset"-nappiin, mikä neuvoo ensin lisäämään varaajan nimi ennen kuin pystyy poistamaan varauksia.