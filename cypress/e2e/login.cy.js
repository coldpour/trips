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
  user_id: userId,
};
function expiresAt(secondsFromNow = 1000) {
  const secondsFromEpoch = Math.ceil(new Date().getTime() / 1000);
  return secondsFromEpoch + secondsFromNow;
}

describe("login", () => {
  it("logs in with valid email", () => {
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
    cy.contains(/delete/i).should("be.visible");
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
      .should("have.value", `${Mexico.nights}`)
      .type("a")
      .should("have.value", "")
      .type("-6")
      .should("have.value", 6);

    cy.contains(/adults/i)
      .find("input")
      .type(Mexico.adults);

    cy.contains(/search airbnb/i)
      .should("be.visible")
      .and("have.attr", "href")
      .and("include", `adults=${Mexico.adults}`)
      .and("include", `date_picker_type=flexible_dates`)
      .and("include", `one_week`)
      .and("include", Mexico.name)
      .and("not.include", `children`);

    cy.log(
      "should calc nights from arrive and depart, overriding previous nights input",
    );
    cy.contains(/arrive/i)
      .find("input")
      .type(Mexico.arrive);
    cy.contains(/depart/i)
      .find("input")
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
    cy.contains(/arrive/i)
      .find("input")
      .should("have.value", "");
    cy.contains(/depart/i)
      .find("input")
      .should("have.value", "");

    cy.contains(/children/i)
      .find("input")
      .type(Mexico.children);
    cy.contains(/people/i).should(
      "include.text",
      Mexico.children + Mexico.adults,
    );

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

    cy.log("fun is a number with a range of 0-10");
    cy.contains(/fun/i)
      .find("input")
      .type(Mexico.fun)
      .should("have.value", `${Mexico.fun}`)
      .type("-6")
      .should("have.value", 6)
      .type("a")
      .should("have.value", "")
      .type(0)
      .should("have.value", "")
      .type("0a12")
      .should("have.value", "10");

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
    cy.contains(/delete/i).click();
    cy.wait("@deleteTrip").its("response.statusCode").should("eq", 200);
    cy.wait("@afterDeteleTripList")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains(London.name).should("not.exist");
    cy.contains(/delete/i).should("have.length", 1);
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
});
