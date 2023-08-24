import requests

def save_link_to_file(link):
    with open("C:\\Users\\Graveto\\Desktop\\Server-FTP\\links_ngrok.txt", "a") as file:
        file.write(link + "\n")

try:
    response = requests.get("http://127.0.0.1:4040/api/tunnels")
    data = response.json()
    tunnels = data["tunnels"]
    for tunnel in tunnels:
        public_url = tunnel["public_url"]
        save_link_to_file(public_url)
        print("Link saved:", public_url)
except Exception as e:
    print("Error:", e)
