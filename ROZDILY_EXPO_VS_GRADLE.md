# Rozdíly mezi Expo/React Native a nativním Android vývojem (Gradle)

## Přehled přístupů

### Nativní Android (Gradle)
- **Jazyk:** Kotlin/Java
- **Build systém:** Gradle
- **IDE:** Android Studio
- **Platforma:** Pouze Android
- **Přístup:** Imperativní (XML + kód) nebo deklarativní (Jetpack Compose)

### Expo/React Native
- **Jazyk:** TypeScript/JavaScript
- **Build systém:** Metro bundler, Expo CLI
- **IDE:** VS Code, WebStorm, jakýkoliv textový editor
- **Platforma:** Cross-platform (Android + iOS + Web)
- **Přístup:** Deklarativní (React komponenty)

---

## 1. Build systém a správa závislostí

### Gradle (Nativní Android)
```gradle
// build.gradle
dependencies {
    implementation 'androidx.room:room-runtime:2.5.0'
    implementation 'com.google.firebase:firebase-firestore:24.0.0'
}
```
- Gradle je nástroj pro automatizaci sestavení projektu
- Závislosti se definují v `build.gradle` souborech
- Kompilace do APK/AAB formátu
- Podpora pro multi-module projekty
- Gradle skripty v Groovy nebo Kotlin DSL

### Expo/React Native
```json
// package.json
"dependencies": {
  "expo": "~50.0.0",
  "react-native": "0.73.0"
}
```
- NPM/Yarn pro správu balíčků
- Závislosti v `package.json`
- Metro bundler pro JavaScript bundling
- Expo spravuje nativní build automaticky
- Jednodušší konfigurace, méně boilerplate kódu

**Hlavní rozdíl:** Gradle vyžaduje více konfigurace a znalosti Android ekosystému, zatímco Expo abstrahuje většinu složitosti.

---

## 2. UI Development

### Nativní Android - XML (Tradiční)
```xml
<!-- activity_main.xml -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World" />
</LinearLayout>
```
```kotlin
// MainActivity.kt
val textView = findViewById<TextView>(R.id.textView)
textView.text = "Nový text"
```
- Separace UI (XML) a logiky (Kotlin/Java)
- Imperativní přístup - ručně měníme stav UI
- Používá `findViewById()` pro přístup k elementům
- Podpora pro ConstraintLayout, LinearLayout, RecyclerView atd.

### Nativní Android - Jetpack Compose (Moderní)
```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello $name")
}
```
- Deklarativní přístup - popisujeme jak by UI mělo vypadat
- UI se automaticky překresluje při změně dat
- Vše v Kotlinu, žádný XML
- Podobnější k React Native

### Expo/React Native
```tsx
// Screen.tsx
export default function Screen() {
  const [name, setName] = useState('World');

  return (
    <View>
      <Text>Hello {name}</Text>
    </View>
  );
}
```
- Deklarativní přístup pomocí React komponent
- Automatické re-rendering při změně state
- JSX/TSX syntaxe (HTML-like v JavaScriptu)
- Cross-platform komponenty (`View`, `Text`, `TouchableOpacity`)

**Hlavní rozdíl:**
- Tradiční Android: XML + imperativní změny
- Jetpack Compose: Deklarativní, podobné React
- React Native: Deklarativní, cross-platform

---

## 3. Navigace

### Android - XML + Intents
```kotlin
// Explicitní intent
val intent = Intent(this, DetailActivity::class.java)
intent.putExtra("userId", 123)
startActivity(intent)

// Navigation Component (moderní)
findNavController().navigate(R.id.detailFragment)
```
- Activity-based navigace pomocí Intentů
- Fragment navigace pomocí Navigation Component
- Každá obrazovka = samostatná Activity nebo Fragment
- Backstack spravován systémem

### React Native - React Navigation
```tsx
// Stack Navigator
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Navigace
navigation.navigate('Detail', { userId: 123 });
```
- Deklarativní definice navigační struktury
- Stack, Tab, Drawer navigátory
- Typovaná navigace s TypeScriptem
- Backstack spravován knihovnou

**Hlavní rozdíl:** Android používá systémové Activity/Fragmenty, React Native vlastní navigační stack v JavaScriptu.

---

## 4. Ukládání dat

### Android - Room Database
```kotlin
// Entity
@Entity(tableName = "users")
data class User(
    @PrimaryKey val id: Int,
    val name: String,
    val email: String
)

// DAO
@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<User>>

    @Insert
    suspend fun insertUser(user: User)
}

// Database
@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```
- Room = abstrakce nad SQLite
- Kontrola SQL dotazů při kompilaci
- Integrace s Kotlin Coroutines a Flow
- Typová bezpečnost

### Android - SharedPreferences
```kotlin
val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
prefs.edit().putString("token", "abc123").apply()
val token = prefs.getString("token", null)
```

### React Native - AsyncStorage / MMKV
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Uložení
await AsyncStorage.setItem('token', 'abc123');

// Načtení
const token = await AsyncStorage.getItem('token');
```

### React Native - SQLite / WatermelonDB
```typescript
// WatermelonDB (React Native ORM)
@model('users')
class User extends Model {
  @field('name') name!: string;
  @field('email') email!: string;
}

// Query
const users = await database.collections
  .get<User>('users')
  .query()
  .fetch();
```

**Hlavní rozdíl:**
- Android má nativní Room s compile-time validací
- React Native používá JS knihovny (AsyncStorage pro key-value, SQLite/WatermelonDB pro databázi)
- Room je typově bezpečnější a rychlejší

---

## 5. Životní cyklus

### Android - Activity/Fragment Lifecycle
```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Inicializace
    }

    override fun onStart() {
        super.onStart()
        // Activity viditelná
    }

    override fun onResume() {
        super.onResume()
        // Activity v popředí
    }

    override fun onPause() {
        super.onPause()
        // Ztráta focus
    }

    override fun onDestroy() {
        super.onDestroy()
        // Úklid
    }
}
```
- Komplexní lifecycle s mnoha metodami
- Systémem řízený lifecycle
- Nutné správně zacházet s rotacemi obrazovky

### React Native - React Hooks
```typescript
function MyScreen() {
  useEffect(() => {
    // ComponentDidMount - při vytvoření
    console.log('Screen mounted');

    return () => {
      // ComponentWillUnmount - při zničení
      console.log('Screen unmounted');
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Při focus obrazovky
      console.log('Screen focused');

      return () => {
        // Při opuštění obrazovky
        console.log('Screen unfocused');
      };
    }, [])
  );

  return <View>...</View>;
}
```
- Jednodušší lifecycle pomocí React hooks
- `useEffect` pro side effects
- `useFocusEffect` pro screen focus events
- Méně boilerplate kódu

**Hlavní rozdíl:** Android má systémový lifecycle, React Native používá JavaScript event-based přístup.

---

## 6. State Management

### Android - ViewModel + LiveData/StateFlow
```kotlin
class UserViewModel : ViewModel() {
    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users

    fun loadUsers() {
        viewModelScope.launch {
            _users.value = repository.getUsers()
        }
    }
}

// V Activity/Fragment
val viewModel: UserViewModel by viewModels()
lifecycleScope.launch {
    viewModel.users.collect { users ->
        // Update UI
    }
}
```
- ViewModel přežije rotace obrazovky
- LiveData/StateFlow pro reaktivní UI
- Lifecycle-aware komponenty

### React Native - React State/Context/Hooks
```typescript
// Custom Hook
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await api.getUsers();
    setUsers(data);
    setLoading(false);
  }, []);

  return { users, loading, loadUsers };
}

// V komponentě
function UsersScreen() {
  const { users, loading, loadUsers } = useUsers();

  return (
    <View>
      {loading ? <Spinner /> : <UserList users={users} />}
    </View>
  );
}
```
- React hooks pro state management
- Context API pro globální state
- Knihovny jako Zustand, Redux Toolkit

**Hlavní rozdíl:** Android má ViewModel pattern a lifecycle-aware komponenty, React Native používá React hooks a jednodušší state management.

---

## 7. Asynchronní operace

### Android - Kotlin Coroutines
```kotlin
viewModelScope.launch {
    try {
        val users = withContext(Dispatchers.IO) {
            repository.fetchUsers()
        }
        _users.value = users
    } catch (e: Exception) {
        _error.value = e.message
    }
}
```
- Kotlin Coroutines s `suspend` funkcemi
- Strukturovaná concurrency
- `viewModelScope`, `lifecycleScope` pro automatický cancel

### React Native - Promises/Async-Await
```typescript
const loadUsers = async () => {
  try {
    setLoading(true);
    const users = await api.fetchUsers();
    setUsers(users);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```
- JavaScript Promises
- Async/await syntax
- Nutné ručně řešit cleanup v useEffect

**Hlavní rozdíl:** Kotlin Coroutines jsou strukturovanější a mají built-in cancellation, JavaScript async/await je jednodušší ale vyžaduje víc manuální práce.

---

## 8. Testování

### Android
```kotlin
// Unit test
@Test
fun `test user validation`() {
    val user = User("John", "john@example.com")
    assertTrue(user.isValid())
}

// UI test (Espresso)
@Test
fun testLogin() {
    onView(withId(R.id.emailInput))
        .perform(typeText("test@test.com"))
    onView(withId(R.id.loginButton))
        .perform(click())
    onView(withText("Welcome"))
        .check(matches(isDisplayed()))
}
```
- JUnit pro unit testy
- Espresso pro UI testy
- Mockito/MockK pro mockování

### React Native
```typescript
// Unit test (Jest)
test('user validation', () => {
  const user = { name: 'John', email: 'john@example.com' };
  expect(isValidUser(user)).toBe(true);
});

// Component test (React Testing Library)
test('login flow', async () => {
  const { getByPlaceholder, getByText } = render(<LoginScreen />);

  fireEvent.changeText(getByPlaceholder('Email'), 'test@test.com');
  fireEvent.press(getByText('Login'));

  await waitFor(() => {
    expect(getByText('Welcome')).toBeTruthy();
  });
});
```
- Jest pro unit testy
- React Testing Library pro component testy
- Detox pro E2E testy

**Hlavní rozdíl:** Android používá Espresso (nativní), React Native Jest + React Testing Library (JavaScript).

---

## 9. Velikost balíčku a výkon

### Android (Gradle)
- **APK velikost:** 5-20 MB (závisí na funkcích)
- **Výkon:** Nativní kód, maximální výkon
- **Startup:** Rychlý (nativní)
- **Build čas:** Pomalejší (Gradle kompilace)

### React Native (Expo)
- **APK velikost:** 30-50 MB (JavaScript bundle + React Native runtime)
- **Výkon:** 95-98% nativního výkonu (JS bridge overhead)
- **Startup:** Mírně pomalejší (inicializace JS engine)
- **Build čas:** Rychlejší development (hot reload)

**Hlavní rozdíl:** Nativní Android je rychlejší a menší, React Native má lepší development experience.

---

## 10. Backend integrace

### Android - Retrofit + OkHttp
```kotlin
interface ApiService {
    @GET("users")
    suspend fun getUsers(): List<User>

    @POST("login")
    suspend fun login(@Body credentials: Credentials): AuthResponse
}

val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val api = retrofit.create(ApiService::class.java)
val users = api.getUsers()
```

### React Native - Fetch/Axios
```typescript
// PocketBase SDK
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.example.com');

// Login
const authData = await pb.collection('users').authWithPassword(
  'email@example.com',
  'password'
);

// Fetch data
const users = await pb.collection('users').getFullList();
```

**Hlavní rozdíl:** Android používá typované Retrofit rozhraní, React Native často plain fetch nebo SDK (jako PocketBase).

---

## 11. Realtime funkce

### Android - Firebase / WebSocket
```kotlin
// Firebase Firestore
val db = FirebaseFirestore.getInstance()
db.collection("events")
    .addSnapshotListener { snapshot, error ->
        if (error != null) return@addSnapshotListener
        val events = snapshot?.toObjects(Event::class.java)
        // Update UI
    }
```

### React Native - PocketBase Realtime
```typescript
// PocketBase realtime subscription
pb.collection('events').subscribe('*', (e) => {
  console.log('Event updated:', e.record);
  // Update state
});
```

**Hlavní rozdíl:** Podobné možnosti, obě platformy podporují WebSocket a Firebase.

---

## Shrnutí - Kdy použít co?

### Použij nativní Android (Gradle) když:
✅ Potřebuješ maximální výkon
✅ Aplikace je pouze pro Android
✅ Potřebuješ přístup k low-level Android API
✅ Komplexní UI s nativními Material Design komponentami
✅ Integrace s Android-specific funkcemi (Widgets, Services)

### Použij Expo/React Native když:
✅ Potřebuješ cross-platform (Android + iOS)
✅ Rychlý vývoj a prototypování
✅ Týmová znalost JavaScriptu/TypeScriptu
✅ Jednodušší maintenance jednoho codebase
✅ Web development background

---

## Finální poznámky

**V tomto projektu (TeamPlay) jsem použil Expo/React Native protože:**

1. **Cross-platform:** Aplikace může běžet na iOS i Androidu bez úprav
2. **Rychlejší vývoj:** React komponenty a hooks jsou intuitivnější než Android lifecycle
3. **TypeScript:** Typová bezpečnost + moderní JavaScript features
4. **Expo ecosystem:** Snadný přístup k device features (kamera, notifikace atd.)
5. **Hot reload:** Okamžitá zpětná vazba při vývoji
6. **PocketBase integrace:** JavaScript SDK je jednodušší než Retrofit
7. **Jedna codebase:** Méně kódu na maintenance

**Nevýhody oproti nativnímu Androidu:**
- Větší velikost aplikace (50 MB vs 10 MB)
- Mírně pomalejší startup
- Závislost na React Native bridge
- Složitější upgrade procesu (Expo + React Native + dependencies)

**Ale pro tento typ aplikace (event management) jsou tyto trade-offy přijatelné vzhledem k benefitům cross-platform vývoje.**
