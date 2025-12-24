const s = `https://tnyckutfhrdjqqhixswv.supabase.co`;
const api = `${s}/rest/v1`;
const auth = `${s}/auth/v1`;
const validEmail = "test@test.com";
const userId = "userId687";
const identityId = "identityId";
const London = {
  id: 13,
  created_at: "2025-10-13T06:20:07.112042+00:00",
  name: "London",
  fun: 10,
  nights: 12,
  adults: 2,
  children: 0,
  arrive: null,
  depart: null,
  flightCostPerSeat: 1200,
  entertainment: 1000,
  taxiOrRentalCar: 0,
  skiPassPerDay: 0,
  childcare: 0,
  lodgingTotal: 0,
  lodgingPerNight: 500,
  lodgingPerPersonPerNight: 0,
  flight_url: "https://flights.example.com/london",
  user_id: userId,
};

const Mexico = {
  id: 14,
  created_at: "2025-10-13T07:20:07.112042+00:00",
  name: "Mexico",
  fun: 8,
  nights: 2,
  adults: 2,
  children: 4,
  arrive: "2025-10-01",
  depart: "2025-10-05",
  flightCostPerSeat: 1200,
  entertainment: 1000,
  taxiOrRentalCar: 0,
  skiPassPerDay: 0,
  childcare: 0,
  lodgingTotal: 0,
  lodgingPerNight: 500,
  lodgingPerPersonPerNight: 0,
  flight_url: "https://flights.example.com/mexico",
  user_id: userId,
};

const MexicoCopy = {
  ...Mexico,
  id: 42,
  created_at: "2025-10-13T08:20:07.112042+00:00",
  name: `${Mexico.name} (copy)`,
};

const VacationList = {
  id: "vacation-list-id",
  name: "Vacations",
  created_at: "2025-10-13T06:00:00.000000+00:00",
  user_id: userId,
};

const WorkTripList = {
  id: "work-trip-list-id",
  name: "Work Trips",
  created_at: "2025-10-13T06:01:00.000000+00:00",
  user_id: userId,
};

const LondonInVacationList = {
  ...London,
  trip_list_id: VacationList.id,
};

const MexicoInWorkList = {
  ...Mexico,
  trip_list_id: WorkTripList.id,
};

function expiresAt(secondsFromNow = 1000) {
  const secondsFromEpoch = Math.ceil(new Date().getTime() / 1000);
  return secondsFromEpoch + secondsFromNow;
}

function openTripOverflowMenu(tripName) {
  cy.contains(tripName)
    .closest("a")
    .parent()
    .within(() => {
      cy.contains("•••").click();
    });
}

describe("app", () => {
  it("exercise user flow", () => {
    cy.visit("http://localhost:5173");
    cy.get('input[type="email"]').type(validEmail);
    cy.get('input[type="password"]').type("bar");
    cy.intercept("POST", `${auth}/token?grant_type=password`, {
      access_token: "abc123",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: expiresAt(),
      refresh_token: "def456",
      user: {
        id: userId,
        aud: "authenticated",
        role: "authenticated",
        email: validEmail,
        email_confirmed_at: "2025-10-13T06:17:53.793213Z",
        phone: "",
        confirmation_sent_at: "2025-10-13T06:16:39.013146Z",
        confirmed_at: "2025-10-13T06:17:53.793213Z",
        last_sign_in_at: "2025-10-13T19:10:18.515640818Z",
        app_metadata: {
          provider: "email",
          providers: ["email"],
        },
        user_metadata: {
          email: validEmail,
          email_verified: true,
          phone_verified: false,
          sub: userId,
        },
        identities: [
          {
            identity_id: identityId,
            id: userId,
            user_id: userId,
            identity_data: {
              email: validEmail,
              email_verified: true,
              phone_verified: false,
              sub: userId,
            },
            provider: "email",
            last_sign_in_at: "2025-10-13T06:09:52.337626Z",
            created_at: "2025-10-13T06:09:52.33769Z",
            updated_at: "2025-10-13T06:09:52.33769Z",
            email: validEmail,
          },
        ],
        created_at: "2025-10-13T06:09:52.272442Z",
        updated_at: "2025-10-13T19:10:18.523558Z",
        is_anonymous: false,
      },
      weak_password: null,
    }).as("login");

    cy.intercept("GET", `${api}/trips?select=*`, [London]).as(
      "initialTripList",
    );
    cy.get("button").contains("Log in").click();
    cy.wait("@login").its("response.statusCode").should("eq", 200);
    cy.wait("@initialTripList").its("response.statusCode").should("eq", 200);
    cy.contains(London.name).should("be.visible");
    cy.contains("•••").should("be.visible");
    cy.contains(/sign out/i).should("be.visible");
    cy.contains(validEmail).should("be.visible");
    cy.contains(/plan/i).click();
    cy.contains(/back/i).click();
    cy.contains(/plan/i).click();
    cy.contains(/name/i)
      .find("input")
      .should("be.visible")
      .type(Mexico.name)
      .should("have.value", Mexico.name);

    cy.log("nights is a number");
    cy.contains(/nights/i)
      .find("input")
      .type(Mexico.nights)
      .should("have.value", 2)
      .type("a")
      .should("have.value", 2)
      .type("-6")
      .should("have.value", 26);

    cy.contains(/adults/i)
      .find("input")
      .type(Mexico.adults);

    cy.contains(/search airbnb/i)
      .should("be.visible")
      .and("have.attr", "href")
      .and("include", `adults=${Mexico.adults}`)
      .and("include", `date_picker_type=flexible_dates`)
      .and("include", `one_month`)
      .and("include", Mexico.name)
      .and("not.include", `children`)
      .and("not.include", `one_week`);

    cy.contains(/flight url/i)
      .find("input")
      .type(Mexico.flight_url)
      .should("have.value", Mexico.flight_url);
    cy.contains(/open flight link/i)
      .should("have.attr", "href", Mexico.flight_url);
    cy.contains(/flight url/i)
      .find("input")
      .clear()
      .should("have.value", "");
    cy.contains(/open flight link/i).should("not.exist");

    cy.log(
      "should calc nights from arrive and depart, overriding previous nights input",
    );
    cy.contains(/arrival/i)
      .find("input")
      .type(Mexico.arrive)
      .should("have.value", Mexico.arrive);
    cy.contains(/departure/i)
      .find("input")
      .should("have.value", "2025-10-27")
      .clear()
      .type(Mexico.depart);
    cy.contains(/nights/i)
      .find("input")
      .should("have.value", 4);

    cy.contains(/search airbnb/i)
      .should("be.visible")
      .and("have.attr", "href")
      .and("include", `adults=${Mexico.adults}`)
      .and("include", `date_picker_type=calendar`)
      .and("include", Mexico.name)
      .and("not.include", `children`)
      .and("not.include", `one_week`);

    cy.log("override nights should clear arrive and depart");
    cy.contains(/nights/i)
      .find("input")
      .clear()
      .should("have.value", "")
      .type("0a12")
      .should("have.value", "12");
    cy.contains(/arrival/i)
      .find("input")
      .should("have.value", "");
    cy.contains(/departure/i)
      .find("input")
      .should("have.value", "");

    cy.contains(/children/i)
      .find("input")
      .type(Mexico.children);
    cy.contains(/total travelers/i).should(
      "include.text",
      Mexico.children + Mexico.adults,
    );
    cy.get('input[name="nights"]').should("have.value", "12");

    cy.contains(/search airbnb/i)
      .should("be.visible")
      .and("have.attr", "href")
      .and("include", `adults=${Mexico.adults}`)
      .and("include", `children=${Mexico.children}`)
      .and("include", `date_picker_type=flexible_dates`)
      .and("include", `one_month`)
      .and("include", Mexico.name)
      .and("not.include", `one_week`)
      .and("not.include", `calendar`);

    cy.contains(/total lodging cost/i)
      .find("input")
      .type("2,345")
      .should("have.value", "2345");
    cy.contains(/^cost per night$/i)
      .find("input")
      .should("have.value", "195.42");
    cy.contains(/^cost per person per night$/i)
      .find("input")
      .should("have.value", "32.57");
    cy.contains(/^cost per night$/i)
      .find("input")
      .type("{selectall}300")
      .should("have.value", "300");
    cy.contains(/total lodging cost/i)
      .find("input")
      .should("have.value", "3600");
    cy.contains(/^cost per person per night$/i)
      .find("input")
      .type("{selectall}50")
      .should("have.value", "50");
    cy.contains(/total lodging cost/i)
      .find("input")
      .should("have.value", "3600");

    cy.log("fun is a number with a range of 0-10");
    cy.get('input[name="fun"]')
      .type(Mexico.fun)
      .should("have.value", Mexico.fun)
      .type("a")
      .should("have.value", Mexico.fun)
      .type("-6")
      .should("have.value", 10)
      .type("{BACKSPACE}{BACKSPACE}0")
      .should("have.value", "")
      .type("0a12")
      .should("have.value", 10);

    cy.log("save it");
    cy.intercept("POST", `${api}/trips`, { statusCode: 201 }).as("createTrip");
    cy.intercept("GET", `${api}/trips?select=*`, [London, Mexico]).as(
      "afterCreateTripList",
    );
    cy.contains(/save/i).click();
    cy.wait("@createTrip").its("response.statusCode").should("eq", 201);
    cy.wait("@afterCreateTripList")
      .its("response.statusCode")
      .should("eq", 200);
    cy.intercept("DELETE", `${api}/trips?id=eq.${London.id}`, []).as(
      "deleteTrip",
    );
    cy.intercept("GET", `${api}/trips?select=*`, [Mexico]).as(
      "afterDeteleTripList",
    );
    openTripOverflowMenu(London.name);
    cy.contains(/^delete$/i).click();
    cy.contains("Delete Trip?")
      .parent()
      .within(() => {
        cy.contains(/^delete$/i).click();
      });
    cy.wait("@deleteTrip").its("response.statusCode").should("eq", 200);
    cy.wait("@afterDeteleTripList")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains(London.name).should("not.exist");
    cy.get(".trip-card").should("have.length", 1);

    cy.intercept("POST", `${api}/trips`, (req) => {
      expect(req.body.name).to.eq(MexicoCopy.name);
      expect(req.body).to.not.have.property("id");
      req.reply({
        statusCode: 201,
      });
    }).as("duplicateTrip");
    cy.intercept("GET", `${api}/trips?select=*`, [Mexico, MexicoCopy]).as(
      "afterDuplicateTripList",
    );

    openTripOverflowMenu(Mexico.name);
    cy.contains(/^duplicate$/i).click();
    cy.wait("@duplicateTrip").its("response.statusCode").should("eq", 201);
    cy.wait("@afterDuplicateTripList")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains(/^Mexico$/).should("be.visible");
    cy.contains(MexicoCopy.name).should("be.visible");
    cy.get(".trip-card").should("have.length", 2);
  });

  it("auto-fills lodging costs when editing a trip", () => {
    cy.visit("http://localhost:5173");
    cy.get('input[type="email"]').type(validEmail);
    cy.get('input[type="password"]').type("bar");
    cy.intercept("POST", `${auth}/token?grant_type=password`, {
      access_token: "abc123",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: expiresAt(),
      refresh_token: "def456",
      user: {
        id: userId,
        aud: "authenticated",
        role: "authenticated",
        email: validEmail,
        email_confirmed_at: "2025-10-13T06:17:53.793213Z",
        phone: "",
        confirmation_sent_at: "2025-10-13T06:16:39.013146Z",
        confirmed_at: "2025-10-13T06:17:53.793213Z",
        last_sign_in_at: "2025-10-13T19:10:18.515640818Z",
        app_metadata: {
          provider: "email",
          providers: ["email"],
        },
        user_metadata: {
          email: validEmail,
          email_verified: true,
          phone_verified: false,
          sub: userId,
        },
        identities: [
          {
            identity_id: identityId,
            id: userId,
            user_id: userId,
            identity_data: {
              email: validEmail,
              email_verified: true,
              phone_verified: false,
              sub: userId,
            },
            provider: "email",
            last_sign_in_at: "2025-10-13T06:09:52.337626Z",
            created_at: "2025-10-13T06:09:52.33769Z",
            updated_at: "2025-10-13T06:09:52.33769Z",
            email: validEmail,
          },
        ],
        created_at: "2025-10-13T06:09:52.272442Z",
        updated_at: "2025-10-13T19:10:18.523558Z",
        is_anonymous: false,
      },
      weak_password: null,
    }).as("login");

    cy.intercept("GET", `${api}/trips?select=*`, [London]).as(
      "initialTripList",
    );
    cy.intercept(
      "GET",
      `${api}/trip_lists?select=*&order=created_at.asc`,
      [],
    ).as("initialTripLists");
    cy.intercept("GET", `${api}/trips?select=*&id=eq.${London.id}`, [
      London,
    ]).as("tripDetail");

    cy.get("button").contains("Log in").click();
    cy.wait("@login").its("response.statusCode").should("eq", 200);
    cy.wait("@initialTripList").its("response.statusCode").should("eq", 200);
    cy.wait("@initialTripLists").its("response.statusCode").should("eq", 200);

    cy.contains(London.name).click();
    cy.wait("@tripDetail").its("response.statusCode").should("eq", 200);

    cy.get('input[name="flight_url"]').should(
      "have.value",
      London.flight_url,
    );
    cy.contains(/open flight link/i)
      .should("have.attr", "href", London.flight_url);
    cy.get('input[name="flight_url"]').clear().should("have.value", "");
    cy.contains(/open flight link/i).should("not.exist");

    cy.get('input[name="arrive"]')
      .clear()
      .type("2025-11-01")
      .should("have.value", "2025-11-01");
    cy.get('input[name="depart"]').should("have.value", "2025-11-13");
    cy.get('input[name="nights"]').should("have.value", "12");
    cy.contains(/total lodging cost/i)
      .find("input")
      .type("{selectall}1200")
      .should("have.value", "1200");
    cy.contains(/^cost per night$/i).find("input").should("have.value", "100");
    cy.contains(/^cost per person per night$/i)
      .find("input")
      .should("have.value", "50");

    cy.contains(/^cost per night$/i)
      .find("input")
      .type("{selectall}150")
      .should("have.value", "150");
    cy.contains(/total lodging cost/i)
      .find("input")
      .should("have.value", "1800");
    cy.contains(/^cost per person per night$/i)
      .find("input")
      .type("{selectall}80")
      .should("have.value", "80");
    cy.contains(/total lodging cost/i)
      .find("input")
      .should("have.value", "1920");

    cy.get('input[name="nights"]')
      .type("{selectall}0")
      .should("have.value", "0");
    cy.get('input[name="arrive"]')
      .clear()
      .type("2025-11-02")
      .should("have.value", "2025-11-02");
    cy.get('input[name="depart"]').should("have.value", "2025-11-03");
  });

  it("nav to register", () => {
    cy.visit("http://localhost:5173");
    cy.contains(/email/i)
      .find("input")
      .should("be.visible")
      .type("asdf")
      .should("have.value", "asdf");
    cy.contains(/password/i)
      .find("input")
      .should("be.visible")
      .type("asdf")
      .should("have.value", "asdf");
    cy.contains(/create account/i).click();
    cy.url().should("include", "/register");
    cy.contains(/email/i)
      .find("input")
      .should("be.visible")
      .and("have.value", "")
      .type("bnm")
      .should("have.value", "bnm");
    cy.contains(/password/i)
      .find("input")
      .should("be.visible")
      .and("have.value", "")
      .type("bnm")
      .should("have.value", "bnm");
    cy.get("button")
      .contains(/create account/i)
      .should("be.visible");
    cy.contains(/login/i).click();
    cy.url().should("not.include", "/register");
    cy.get("button")
      .contains(/log in/i)
      .should("be.visible");
  });

  it("trip list organization features", () => {
    cy.visit("http://localhost:5173");
    cy.get('input[type="email"]').type(validEmail);
    cy.get('input[type="password"]').type("bar");
    
    cy.intercept("POST", `${auth}/token?grant_type=password`, {
      access_token: "abc123",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: expiresAt(),
      refresh_token: "def456",
      user: {
        id: userId,
        aud: "authenticated",
        role: "authenticated",
        email: validEmail,
        email_confirmed_at: "2025-10-13T06:17:53.793213Z",
        phone: "",
        confirmation_sent_at: "2025-10-13T06:16:39.013146Z",
        confirmed_at: "2025-10-13T06:17:53.793213Z",
        last_sign_in_at: "2025-10-13T19:10:18.515640818Z",
        app_metadata: {
          provider: "email",
          providers: ["email"],
        },
        user_metadata: {
          email: validEmail,
          email_verified: true,
          phone_verified: false,
          sub: userId,
        },
        identities: [
          {
            identity_id: identityId,
            id: userId,
            user_id: userId,
            identity_data: {
              email: validEmail,
              email_verified: true,
              phone_verified: false,
              sub: userId,
            },
            provider: "email",
            last_sign_in_at: "2025-10-13T06:09:52.337626Z",
            created_at: "2025-10-13T06:09:52.33769Z",
            updated_at: "2025-10-13T06:09:52.33769Z",
            email: validEmail,
          },
        ],
        created_at: "2025-10-13T06:09:52.272442Z",
        updated_at: "2025-10-13T19:10:18.523558Z",
        is_anonymous: false,
      },
      weak_password: null,
    }).as("login");

    cy.intercept("GET", `${api}/trips?select=*`, [LondonInVacationList, MexicoInWorkList]).as("initialTripList");
    cy.intercept("GET", `${api}/trip_lists?select=*&order=created_at.asc`, [VacationList, WorkTripList]).as("initialTripListList");
    
    cy.get("button").contains("Log in").click();
    cy.wait("@login").its("response.statusCode").should("eq", 200);
    cy.wait("@initialTripList").its("response.statusCode").should("eq", 200);
    cy.wait("@initialTripListList").its("response.statusCode").should("eq", 200);

    cy.log("verify sidebar with trip lists is visible");
    cy.contains(/all trips/i).should("be.visible");
    cy.contains(/trip lists/i).should("be.visible");
    cy.contains(VacationList.name).should("be.visible");
    cy.contains(WorkTripList.name).should("be.visible");

    cy.log("verify trip counts are displayed");
    cy.contains(/all trips/i).parent().should("contain", "2");
    cy.contains(VacationList.name).parent().should("contain", "1");
    cy.contains(WorkTripList.name).parent().should("contain", "1");

    cy.log("filter trips by clicking Vacations list");
    cy.contains(VacationList.name).click();
    cy.url().should("include", `list=${VacationList.id}`);
    cy.contains(London.name).should("be.visible");
    cy.contains(Mexico.name).should("not.exist");

    cy.log("filter trips by clicking Work Trips list");
    cy.contains(WorkTripList.name).click();
    cy.url().should("include", `list=${WorkTripList.id}`);
    cy.contains(Mexico.name).should("be.visible");
    cy.contains(London.name).should("not.exist");

    cy.log("click All Trips to show all trips");
    cy.contains(/all trips/i).click();
    cy.url().should("not.include", "list=");
    cy.contains(London.name).should("be.visible");
    cy.contains(Mexico.name).should("be.visible");

    cy.log("create a new trip list");
    cy.contains(/\+ new list/i).click();
    cy.get('input[placeholder*="List name"]').should("be.visible");
    cy.get('input[placeholder*="List name"]').type("Weekend Getaways");
    
    cy.intercept("POST", `${api}/trip_lists`, (req) => {
      expect(req.body.name).to.eq("Weekend Getaways");
      req.reply({ statusCode: 201 });
    }).as("createTripList");
    
    const WeekendList = {
      id: "weekend-list-id",
      name: "Weekend Getaways",
      created_at: "2025-10-13T06:02:00.000000+00:00",
      user_id: userId,
    };
    cy.intercept("GET", `${api}/trip_lists?select=*&order=created_at.asc`, [VacationList, WorkTripList, WeekendList]).as("afterCreateTripListList");
    
    cy.contains(/^add$/i).click();
    cy.wait("@createTripList").its("response.statusCode").should("eq", 201);
    cy.wait("@afterCreateTripListList").its("response.statusCode").should("eq", 200);
    cy.contains("Weekend Getaways").should("be.visible");

    cy.log("move trip to different list");
    cy.contains(London.name).should("be.visible");
    cy.contains(London.name)
      .parent()
      .find("select")
      .select(WorkTripList.name);
    
    const LondonInWorkList = {
      ...London,
      trip_list_id: WorkTripList.id,
    };
    cy.intercept("PATCH", `${api}/trips?id=eq.${London.id}`, (req) => {
      expect(req.body.trip_list_id).to.eq(WorkTripList.id);
      req.reply({ statusCode: 204 });
    }).as("moveTripToList");
    cy.intercept("GET", `${api}/trips?select=*`, [LondonInWorkList, MexicoInWorkList]).as("afterMoveTripList");
    
    cy.wait("@moveTripToList").its("response.statusCode").should("eq", 204);
    cy.wait("@afterMoveTripList").its("response.statusCode").should("eq", 200);

    cy.log("verify trip counts updated after move");
    cy.contains(VacationList.name).parent().should("contain", "0");
    cy.contains(WorkTripList.name).parent().should("contain", "2");

    cy.log("rename trip list");
    cy.contains(VacationList.name).parent().parent().trigger("mouseenter");
    cy.get(`[data-testid="rename-list-${VacationList.id}"]`).click({ force: true });
    cy.focused().should('have.value', VacationList.name).clear().type("Summer Vacations");
    
    cy.intercept("PATCH", `${api}/trip_lists?id=eq.${VacationList.id}`, (req) => {
      expect(req.body.name).to.eq("Summer Vacations");
      req.reply({ statusCode: 204 });
    }).as("renameTripList");
    
    const RenamedVacationList = {
      ...VacationList,
      name: "Summer Vacations",
    };
    cy.intercept("GET", `${api}/trip_lists?select=*&order=created_at.asc`, [RenamedVacationList, WorkTripList, WeekendList]).as("afterRenameTripListList");
    
    cy.contains(/^save$/i).click();
    cy.wait("@renameTripList").its("response.statusCode").should("eq", 204);
    cy.wait("@afterRenameTripListList").its("response.statusCode").should("eq", 200);
    cy.contains("Summer Vacations").should("be.visible");
    cy.contains(/^Vacations$/).should("not.exist");

    cy.log("delete trip list");
    cy.intercept("DELETE", `${api}/trip_lists?id=eq.${VacationList.id}`, { statusCode: 200 }).as("deleteTripList");
    cy.intercept("GET", `${api}/trip_lists?select=*&order=created_at.asc`, [WorkTripList, WeekendList]).as("afterDeleteTripListList");
    cy.intercept("GET", `${api}/trips?select=*`, [LondonInWorkList, MexicoInWorkList]).as("afterDeleteTripList2");
    
    cy.on('window:confirm', () => true);
    cy.contains("Summer Vacations").parent().parent().trigger("mouseenter");
    cy.get(`[data-testid="delete-list-${VacationList.id}"]`).click({ force: true });
    
    cy.wait("@deleteTripList").its("response.statusCode").should("eq", 200);
    cy.wait("@afterDeleteTripListList").its("response.statusCode").should("eq", 200);
    cy.wait("@afterDeleteTripList2").its("response.statusCode").should("eq", 200);
    cy.contains("Summer Vacations").should("not.exist");

    cy.log("cancel renaming a list with Escape key");
    cy.contains(WorkTripList.name).parent().parent().trigger("mouseenter");
    cy.get(`[data-testid="rename-list-${WorkTripList.id}"]`).click({ force: true });
    cy.focused().should('have.value', WorkTripList.name).clear().type("Should Not Save{esc}");
    cy.contains(WorkTripList.name).should("be.visible");
    cy.contains("Should Not Save").should("not.exist");

    cy.log("cancel creating a new list");
    cy.contains(/\+ new list/i).click();
    cy.get('input[placeholder*="List name"]').type("Temporary List");
    cy.contains(/^cancel$/i).click();
    cy.get('input[placeholder*="List name"]').should("not.exist");
    cy.contains("Temporary List").should("not.exist");

    cy.log("search filter works with list filter");
    cy.contains(WorkTripList.name).click();
    cy.get('input[placeholder*="Search by name"]').type("Mexico");
    cy.contains(Mexico.name).should("be.visible");
    cy.contains(London.name).should("not.exist");
    
    cy.get('input[placeholder*="Search by name"]').clear();
    cy.contains(Mexico.name).should("be.visible");
    cy.contains(London.name).should("be.visible");
  });
});
