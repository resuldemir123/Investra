
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from .models import Analysis
from .serializers import AnalysisSerializer, RegisterSerializer, UserSerializer
import google.generativeai as genai
import json

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('email')
    password = request.data.get('password')
    
    from django.contrib.auth.models import User
    try:
        user_obj = User.objects.get(email=username)
        username = user_obj.username
    except User.DoesNotExist:
        pass

    user = authenticate(request, username=username, password=password)
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out"})

@api_view(['POST'])
@permission_classes([AllowAny]) # For dev, realistically should be IsAuthenticated but keeping it open for quick test
def analyze_startup(request):
    summary = request.data.get('summary')
    if not summary:
        return Response({"error": "Summary is required"}, status=status.HTTP_400_BAD_REQUEST)

    model = genai.GenerativeModel('gemini-flash-latest')
    prompt = f"""
    Sen profesyonel bir Venture Capital (VC) analisti ve stratejistisin. Aşağıdaki girişim özetini derinlemesine analiz et ve akademik frameworkleri (SWOT, Unit Economics, PESTEL) kullanarak yapılandırılmış bir rapor sun:
    
    "{summary}"
    
    Yanıtı sadece bu JSON formatında ver:
    {{
      "executiveSummary": "Yatırımcı tezi ve kısa özet",
      "valuationRange": "Tahmini değerleme aralığı (Dolar bazında)",
      "burnRateFactor": "Optimize Edilmiş / Riskli / Verimli",
      "tam2025": "Hedef pazar büyüklüğü",
      "scores": {{
        "market": 0-100,
        "team": 0-100,
        "product": 0-100,
        "finance": 0-100
      }},
      "industryAverage": {{
        "market": 0-100,
        "team": 0-100,
        "product": 0-100,
        "finance": 0-100
      }},
      "growthProjections": [
        {{"year": "2025", "marketSize": "Değer"}},
        {{"year": "2026", "marketSize": "Değer"}},
        {{"year": "2027", "marketSize": "Değer"}},
        {{"year": "2028", "marketSize": "Değer"}},
        {{"year": "2029", "marketSize": "Değer"}}
      ],
      "swot": {{
        "strengths": ["Güçlü yön 1"],
        "weaknesses": ["Zayıf yön 1"],
        "opportunities": ["Fırsat 1"],
        "threats": ["Tehdit 1"]
      }},
      "unitEconomics": {{
        "cac": "Müşteri Edinme Maliyeti Tahmini",
        "ltv": "Müşteri Yaşam Boyu Değeri Tahmini",
        "payback": "Geri Dönüş Süresi",
        "ratio": "LTV/CAC Oranı Tahmini"
      }},
      "strategicAdvice": ["Stratejik öneri 1"]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Parse JSON
        result_text = response.text
        # Clean markdown code blocks if present
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]
        elif "```" in result_text:
             result_text = result_text.split("```")[1]
             
        data = json.loads(result_text)
        return Response(data)
    except Exception as e:
        print(e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from .firebase_config import get_firestore_client
from google.cloud import firestore # for Timestamp if needed, or just standard dict

class AnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = AnalysisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Analysis.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Save to local SQLite
        analysis = serializer.save(user=self.request.user)
        
        # Sync to Firestore
        db_client = get_firestore_client()
        if db_client:
            try:
                # We use the user's email or ID as the parent key
                user_id = str(self.request.user.id)
                email = self.request.user.email
                
                # Create a document in users/{user_id}/analyses/{analysis_id}
                # To match previous structure, we might want to ensure 'users' doc exists
                user_ref = db_client.collection('users').document(user_id)
                # Optional: Sync user profile data if not exists
                user_ref.set({
                    'email': email,
                    'username': self.request.user.username,
                    'last_synced': firestore.SERVER_TIMESTAMP
                }, merge=True)

                # Add analysis
                doc_ref = user_ref.collection('analyses').document(str(analysis.id))
                doc_ref.set({
                    'title': analysis.title,
                    'summary': analysis.summary,
                    'result': analysis.result,
                    'created_at': firestore.SERVER_TIMESTAMP,
                    'source': 'django_backend'
                })
                print(f"Synced Analysis {analysis.id} to Firestore.")
            except Exception as e:
                print(f"Failed to sync to Firestore: {e}")
        else:
            print("Firestore client not available. Skipping sync.")

@api_view(['GET'])
@permission_classes([AllowAny])
def market_intelligence(request):
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = """
        Sen uzman bir pazar araştırmacısısın. Global startup ekosistemi için güncel bir "Pazar İstihbaratı" raporu oluştur.
        
        Şu anki (2025/2026 perspektifiyle) trendleri baz al.
        
        Yanıtı sadece şu JSON formatında ver:
        {
            "globalSentiment": "Bullish" | "Bearish" | "Neutral",
            "sentimentScore": 0-100 (100 is extremely bullish),
            "trends": [
                {"title": "Trend Başlığı", "description": "Kısa açıklama", "impact": "High/Medium"}
            ],
            "hotSectors": [
                {"name": "Sektör Adı", "growth": "% büyüme tahmini", "reason": "Neden popüler?"}
            ],
            "vcActivity": "Yatırımcı aktivite özeti (kısa paragraf)"
        }
        """
        
        response = model.generate_content(prompt)
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1]
            
        data = json.loads(text)
        return Response(data)
    except Exception as e:
        print(f"Market Intel Error: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
