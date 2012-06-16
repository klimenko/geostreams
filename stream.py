import webapp2
import fix_path
from twython import Twython
from instagram.client import InstagramAPI
import json

class Stream(webapp2.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = "application/json"
		callback = self.request.get('callback')
		self.response.out.write((callback+'(' if callback else '') +
			json.dumps(self.read_instagram() + self.read_twitter(), indent=4) +
		(')' if callback else ''))

	def read_twitter(self):
		twitter = Twython()
		geotweets = twitter.search(geocode="54.312422232222,48.39562501,10km")
		res = []
		for t in geotweets['results']:
			media = []
			if t.has_key('entities') and t['entities'].has_key('media'):
				for m in t['entities']['media']:
					media.push({
						"url": m["url"],
						"type": m["type"]
					})
			res.append({
				'created_at': t['created_at'],
				'id': t['id'],
				'from_user': t['from_user'],
				'from_user_id': t['from_user_id'],
				'from_user_name': t['from_user_name'],
				'profile_image_url': t['profile_image_url'],
				'text': t['text'],
				'entities': {"media": media},
				'source_type': "twitter"
			})
		return res

	def read_instagram(self):
		api = InstagramAPI(client_id='1a405b6f113a4476a8b08c304b964fbc', client_secret='2fe657c6a57c46e3b6edde6306336e78')
		media = api.media_search(lat="54.312422232222", lng="48.39562501", distance="10km")
		res = []
		for m in media:
			#import pdb
			#pdb.set_trace()
			res.append({
				'created_at': m.created_time.strftime("%a, %d %b %Y %H:%M:%S %z"),
				'id': m.id,
				'from_user': m.user.username,
				'from_user_id': m.user.id,
				'from_user_name': m.user.full_name,
				'profile_image_url': m.user.profile_picture,
				'text': m.caption.text if m.caption else "",
				'entities': {"media": [
					{
						"url": m.images['standard_resolution'].url,
						"type": "photo",
						"sizes": {"large": {"w": 612, "h": 612}}
					}
				]},
				'source_type': "instagram"
			})
		return res

app = webapp2.WSGIApplication([('/stream', Stream)], debug=True)

# CLIENT INFO
# CLIENT ID	1a405b6f113a4476a8b08c304b964fbc
# CLIENT SECRET	2fe657c6a57c46e3b6edde6306336e78
# WEBSITE URL	http://geostrea.ms
# REDIRECT URI	http://geostrea.ms
# Paste in code in query string after redirect: 14af5ac97e264b538c936b5a62688109
# access token:
# ('30597661.1a405b6.18c1867660fe49039a5dcab2eb678802', {'username': 'ylukyanov', 'bio': '', 'website': '', 'profile_picture': 'http://images.instagram.com/profiles/anonymousUser.jpg', 'full_name': '', 'id': '30597661'})

