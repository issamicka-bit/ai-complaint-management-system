# urgency.py
# Sehemu ya kutambua "uzito/dharura" (urgency) ya lalamiko kwa kuangalia
# maneno maalum ndani ya maandishi. Hii ni njia rahisi (rule-based) inayofanya
# kazi vizuri kwa maneno ya Kiswahili na Kiingereza kwa pamoja.

URGENT_WORDS = [
    "danger", "dangerous", "emergency", "fire", "electrocute", "electrocuted",
    "collapsing", "collapse", "injured", "injury", "death", "died", "explosion",
    "explode", "hatari", "dharura", "moto", "hatarini", "kifo", "amefariki",
    "jeraha", "limelipuka", "linalipuka", "hospitali", "mtoto",
]

HIGH_WORDS = [
    "urgent", "immediately", "flooding", "flood", "burst", "leak", "sparking",
    "blocking", "outbreak", "harakaharaka", "haraka", "linamwaga", "limevunjika",
    "linatoa cheche", "limeziba", "linaziba",
]

MEDIUM_WORDS = [
    "week", "days", "since", "repeatedly", "frequent", "wiki", "siku", "tangu",
    "mara kwa mara", "kila mara",
]


def score_urgency(text: str):
    """
    Inarudisha (urgency_score kati ya 0.0-1.0, priority label).
    Inaangalia maneno ndani ya maandishi ili kupima uzito wa tatizo.
    """
    text_lower = text.lower()

    if any(word in text_lower for word in URGENT_WORDS):
        return 0.95, "urgent"

    if any(word in text_lower for word in HIGH_WORDS):
        return 0.7, "high"

    if any(word in text_lower for word in MEDIUM_WORDS):
        return 0.45, "normal"

    return 0.25, "low"