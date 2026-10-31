"""Default categories for new users + realistic demo data for the demo account."""
import random
from calendar import monthrange
from datetime import date

from sqlalchemy.orm import Session

from .models import Budget, Category, Transaction, User

DEFAULT_CATEGORIES = [
    # (name, type, color)
    ("Salary", "income", "#10b981"),
    ("Freelance", "income", "#14b8a6"),
    ("Other Income", "income", "#84cc16"),
    ("Food & Dining", "expense", "#f97316"),
    ("Transport", "expense", "#3b82f6"),
    ("Rent", "expense", "#8b5cf6"),
    ("Utilities", "expense", "#06b6d4"),
    ("Shopping", "expense", "#ec4899"),
    ("Entertainment", "expense", "#eab308"),
    ("Health", "expense", "#ef4444"),
    ("Education", "expense", "#6366f1"),
    ("Other", "expense", "#64748b"),
]


def create_default_categories(db: Session, user: User) -> dict[str, Category]:
    cats: dict[str, Category] = {}
    for name, type_, color in DEFAULT_CATEGORIES:
        c = Category(user_id=user.id, name=name, type=type_, color=color)
        db.add(c)
        cats[name] = c
    db.flush()  # assigns ids without committing yet
    return cats


def _months_back(today: date, back: int) -> tuple[int, int]:
    total = today.year * 12 + (today.month - 1) - back
    return total // 12, total % 12 + 1


def seed_demo_data(db: Session, user: User, cats: dict[str, Category]) -> None:
    """6 months of believable income/expenses (fixed random seed = same every time)."""
    rng = random.Random(42)
    today = date.today()

    def add(cat: str, amount: float, year: int, month: int, day: int, desc: str):
        last_day = monthrange(year, month)[1]
        d = date(year, month, min(day, last_day))
        if d > today:
            return
        db.add(Transaction(
            user_id=user.id, category_id=cats[cat].id, type=cats[cat].type,
            amount=round(amount, 2), description=desc, date=d,
        ))

    food_places = ["Jollibee", "Grocery run", "Coffee", "Lunch with friends", "Milk tea", "Dinner out"]
    transport = ["Grab ride", "Jeepney", "MRT top-up", "Gas"]
    shop = ["Clothes", "Gadget accessory", "Online order", "Shoes"]
    fun = ["Movie night", "Spotify", "Netflix", "Concert ticket", "Games"]

    for back in range(5, -1, -1):
        y, m = _months_back(today, back)
        add("Salary", 45000, y, m, 1, "Monthly salary")
        if rng.random() < 0.6:
            add("Freelance", rng.randint(4000, 12000), y, m, rng.randint(5, 25), "Freelance project")
        add("Rent", 12000, y, m, 3, "Monthly rent")
        add("Utilities", rng.randint(2800, 4200), y, m, 8, "Electricity & water")
        add("Utilities", 1299, y, m, 12, "Internet")
        for _ in range(rng.randint(14, 20)):
            add("Food & Dining", rng.randint(120, 650), y, m, rng.randint(1, 28), rng.choice(food_places))
        for _ in range(rng.randint(6, 10)):
            add("Transport", rng.randint(40, 320), y, m, rng.randint(1, 28), rng.choice(transport))
        for _ in range(rng.randint(1, 3)):
            add("Shopping", rng.randint(500, 3200), y, m, rng.randint(1, 28), rng.choice(shop))
        for _ in range(rng.randint(2, 4)):
            add("Entertainment", rng.randint(150, 900), y, m, rng.randint(1, 28), rng.choice(fun))
        if rng.random() < 0.5:
            add("Health", rng.randint(300, 2000), y, m, rng.randint(1, 28), "Pharmacy / checkup")
        if rng.random() < 0.3:
            add("Education", rng.randint(500, 2500), y, m, rng.randint(1, 28), "Course / books")

    for cat, limit in [("Food & Dining", 9000), ("Transport", 3000),
                       ("Shopping", 4000), ("Entertainment", 2500)]:
        db.add(Budget(user_id=user.id, category_id=cats[cat].id, amount=limit))
