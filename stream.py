import webapp2
from twython import Twython
from instagram.client import InstagramAPI
import json

class Stream(webapp2.RequestHandler):
	def get(self):
		print "callback("
		print json.dumps(read_twitter() + read_instagram(), indent=4)
		print ")"

	def read_twitter():
		twitter = Twython()
		geotweets = twitter.search(geocode="54.312422232222,48.39562501,10km")
		res = []
		for t in geotweets['results']:
			res.append({
				'created_at': t['created_at'],
				'id': t['id'],
				'from_user': t['from_user'],
				'from_user_id': t['from_user_id'],
				'profile_image_url': t['profile_image_url'],
				'text': t['text'],
				'source_type': "twitter"
			})
		return res

	def read_instagram():
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
				'profile_image_url': m.user.profile_picture,
				'text': m.caption.text if m.caption else "",
				'source_type': "instagram"
			})
		return res

# CLIENT INFO
# CLIENT ID	1a405b6f113a4476a8b08c304b964fbc
# CLIENT SECRET	2fe657c6a57c46e3b6edde6306336e78
# WEBSITE URL	http://geostrea.ms
# REDIRECT URI	http://geostrea.ms
# Paste in code in query string after redirect: 14af5ac97e264b538c936b5a62688109
# access token:
# ('30597661.1a405b6.18c1867660fe49039a5dcab2eb678802', {'username': 'ylukyanov', 'bio': '', 'website': '', 'profile_picture': 'http://images.instagram.com/profiles/anonymousUser.jpg', 'full_name': '', 'id': '30597661'})

