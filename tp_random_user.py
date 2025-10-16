import json
import os
import requests


API_KEY = os.getenv('RANDOMMER_API_KEY', 'bb92984616f348758b48104571eace91')

HEADERS = {'X-Api-Key': API_KEY}


JOKE_API = "https://official-joke-api.appspot.com/random_joke"
ADVICE_API = "https://api.adviceslip.com/advice"


def safe_get_json(resp):
    """Retourne JSON si possible, sinon texte brut"""
    try:
        return resp.json()
    except ValueError:
        return resp.text.strip('"') if resp.text else None


def get_pipeline():
    profile = {}
    try:

        user_resp = requests.get('https://randomuser.me/api/')
        user_resp.raise_for_status()
        user_data = user_resp.json()['results'][0]


        phone_resp = requests.get('https://randommer.io/api/Phone/Generate?CountryCode=FR&Quantity=1', headers=HEADERS)
        phone_resp.raise_for_status()
        phone = safe_get_json(phone_resp)


        iban_resp = requests.get('https://randommer.io/api/Finance/Iban/FR', headers=HEADERS)
        iban_resp.raise_for_status()
        iban = safe_get_json(iban_resp)

        card_resp = requests.get('https://randommer.io/api/Card?type=AmericanExpress', headers=HEADERS)
        card_resp.raise_for_status()
        credit_card = safe_get_json(card_resp)


        name_resp = requests.get('https://randommer.io/api/Name?nameType=fullname&quantity=1', headers=HEADERS)
        name_resp.raise_for_status()
        random_name = safe_get_json(name_resp)



        joke_resp = requests.get(JOKE_API)
        joke_resp.raise_for_status()
        joke_data = joke_resp.json()
        joke = f"{joke_data.get('setup','')} — {joke_data.get('punchline','')}"


        advice_resp = requests.get(ADVICE_API)
        advice_resp.raise_for_status()
        advice = advice_resp.json().get('slip', {}).get('advice', '')


        profile = {
            "Utilisateur": {
                "nom_complet": f"{user_data['name']['first']} {user_data['name']['last']}",
                "email": user_data['email'],
                "ville": user_data['location']['city'],
                "pays": user_data['location']['country'],
                "photo": user_data['picture']['large']
            },
            "Nom aléatoire": random_name,
            "Téléphone": phone,
            "IBAN": iban,
            "Carte de crédit": credit_card,
            "Blague": joke,
            "Conseil du jour": advice
        }

    except requests.RequestException as err:
        print(f"ERROR Pipeline -> {err}")

    return profile

if __name__ == "__main__":
    profile = get_pipeline()
    print(json.dumps(profile, indent=4, ensure_ascii=False))
