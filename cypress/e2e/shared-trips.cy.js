const s = `https://tnyckutfhrdjqqhixswv.supabase.co`;
const shareToken = "test-share-token-123";

const SharedTripList = {
  id: "shared-list-id",
  name: "Beach Vacations 2025",
  created_at: "2025-10-13T06:00:00.000000+00:00",
  user_id: "owner-user-id",
  share_token: shareToken,
};

const ParisTrip = {
  id: "paris-123",
  created_at: "2025-10-13T06:20:07.112042+00:00",
  name: "Paris",
  fun: 9,
  nights: 7,
  adults: 2,
  children: 0,
  arrive: "2025-06-01",
  depart: "2025-06-08",
  flightCostPerSeat: 800,
  entertainment: 500,
  taxiOrRentalCar: 200,
  skiPassPerDay: 0,
  childcare: 0,
  lodgingTotal: 0,
  lodgingPerNight: 150,
  lodgingPerPersonPerNight: 0,
  flight_url: "https://flights.example.com/paris",
  trip_list_id: SharedTripList.id,
};

const TokyoTrip = {
  id: "tokyo-456",
  created_at: "2025-10-13T07:20:07.112042+00:00",
  name: "Tokyo",
  fun: 10,
  nights: 10,
  adults: 2,
  children: 1,
  arrive: "2025-08-15",
  depart: "2025-08-25",
  flightCostPerSeat: 1200,
  entertainment: 1000,
  taxiOrRentalCar: 100,
  skiPassPerDay: 0,
  childcare: 200,
  lodgingTotal: 2000,
  lodgingPerNight: 0,
  lodgingPerPersonPerNight: 0,
  flight_url: "https://flights.example.com/tokyo",
  trip_list_id: SharedTripList.id,
};

const BaliTrip = {
  id: "bali-789",
  created_at: "2025-10-13T08:20:07.112042+00:00",
  name: "Bali",
  fun: 8,
  nights: 14,
  adults: 4,
  children: 2,
  arrive: null,
  depart: null,
  flightCostPerSeat: 900,
  entertainment: 600,
  taxiOrRentalCar: 150,
  skiPassPerDay: 0,
  childcare: 0,
  lodgingTotal: 0,
  lodgingPerNight: 0,
  lodgingPerPersonPerNight: 80,
  flight_url: null,
  trip_list_id: SharedTripList.id,
};

describe("shared trips", () => {
  beforeEach(() => {
    cy.intercept("POST", `${s}/rest/v1/rpc/get_shared_trip_list`, (req) => {
      if (req.body.token === shareToken) {
        req.reply([SharedTripList]);
      } else {
        req.reply({ statusCode: 404 });
      }
    }).as("getSharedTripList");

    cy.intercept("POST", `${s}/rest/v1/rpc/get_shared_trips`, (req) => {
      if (req.body.token === shareToken) {
        req.reply([ParisTrip, TokyoTrip, BaliTrip]);
      } else {
        req.reply({ statusCode: 404 });
      }
    }).as("getSharedTrips");
  });

  it("displays shared trip list without authentication", () => {
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}`);
    
    cy.wait("@getSharedTripList").its("response.statusCode").should("eq", 200);
    cy.wait("@getSharedTrips").its("response.statusCode").should("eq", 200);

    cy.log("verify read-only banner is visible");
    cy.contains(/you're viewing a shared trip list/i).should("be.visible");
    cy.contains(/read-only/i).should("be.visible");

    cy.log("verify trip list name is displayed");
    cy.contains(SharedTripList.name).should("be.visible");

    cy.log("verify trip count is displayed");
    cy.contains(/3 trips shared with you/i).should("be.visible");

    cy.log("verify all trips are displayed");
    cy.contains(ParisTrip.name).should("be.visible");
    cy.contains(TokyoTrip.name).should("be.visible");
    cy.contains(BaliTrip.name).should("be.visible");

    cy.log("verify trip cards show key information");
    cy.contains(".trip-card", ParisTrip.name)
      .within(() => {
        cy.contains("Fun").parent().should("contain", `${ParisTrip.fun}/10`);
        cy.contains("Nights").parent().should("contain", ParisTrip.nights);
        cy.contains("Cost").should("be.visible");
      });

    cy.log("verify no edit controls are present");
    cy.contains(/delete/i).should("not.exist");
    cy.contains(/duplicate/i).should("not.exist");
    cy.contains(/sign out/i).should("not.exist");
  });

  it("filters shared trips by search keyword", () => {
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getSharedTrips");

    cy.log("verify all trips visible initially");
    cy.contains(ParisTrip.name).should("be.visible");
    cy.contains(TokyoTrip.name).should("be.visible");
    cy.contains(BaliTrip.name).should("be.visible");

    cy.log("filter by Tokyo");
    cy.get('input[placeholder*="Search by name"]').type("Tokyo");
    cy.contains(TokyoTrip.name).should("be.visible");
    cy.contains(ParisTrip.name).should("not.exist");
    cy.contains(BaliTrip.name).should("not.exist");

    cy.log("clear filter");
    cy.get('input[placeholder*="Search by name"]').clear();
    cy.contains(ParisTrip.name).should("be.visible");
    cy.contains(TokyoTrip.name).should("be.visible");
    cy.contains(BaliTrip.name).should("be.visible");

    cy.log("filter with no results");
    cy.get('input[placeholder*="Search by name"]').type("Antarctica");
    cy.contains(/no trips found/i).should("be.visible");
    cy.contains(ParisTrip.name).should("not.exist");
  });

  it("sorts shared trips by different criteria", () => {
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getSharedTrips");

    cy.log("default sort is by score (descending)");
    cy.get('select').should("have.value", "score");

    cy.log("sort by name (ascending)");
    cy.get('select').select("name");
    cy.get(".trip-card").eq(0).should("contain", BaliTrip.name);
    cy.get(".trip-card").eq(1).should("contain", ParisTrip.name);
    cy.get(".trip-card").eq(2).should("contain", TokyoTrip.name);

    cy.log("sort by cost (ascending)");
    cy.get('select').select("cost");
    cy.get(".trip-card").first().should("contain", ParisTrip.name);
  });

  it("displays shared trip detail in read-only mode", () => {
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getSharedTrips");

    cy.log("click on Paris trip to view details");
    cy.contains(ParisTrip.name).click();
    cy.url().should("include", `/shared/${shareToken}/${ParisTrip.id}`);

    cy.log("verify read-only banner is visible");
    cy.contains(/you're viewing a shared trip/i).should("be.visible");
    cy.contains(/read-only/i).should("be.visible");

    cy.log("verify all trip details are displayed");
    cy.contains("h1", ParisTrip.name).should("be.visible");
    cy.get('input[name="fun"]').should("have.value", ParisTrip.fun);
    cy.get('input[name="adults"]').should("have.value", ParisTrip.adults);
    cy.get('input[name="children"]').should("have.value", ParisTrip.children);
    cy.get('input[name="nights"]').should("have.value", ParisTrip.nights);

    cy.log("verify travel information");
    cy.get('input[name="flightCostPerSeat"]').should("have.value", ParisTrip.flightCostPerSeat);
    cy.get('input[name="taxiOrRentalCar"]').should("have.value", ParisTrip.taxiOrRentalCar);
    cy.get('input[name="flight_url"]').should("have.value", ParisTrip.flight_url);
    cy.contains(/open flight link/i)
      .should("have.attr", "href", ParisTrip.flight_url);

    cy.log("verify lodging information");
    cy.get('input[name="lodgingPerNight"]').should("have.value", ParisTrip.lodgingPerNight);

    cy.log("verify entertainment information");
    cy.get('input[name="entertainment"]').should("have.value", ParisTrip.entertainment);

    cy.log("verify all inputs are disabled");
    cy.get('input[name="fun"]').should("be.disabled");
    cy.get('input[name="adults"]').should("be.disabled");
    cy.get('input[name="nights"]').should("be.disabled");

    cy.log("verify no Save button is present");
    cy.contains(/^save$/i).should("not.exist");

    cy.log("verify Back link is present and functional");
    cy.contains(/back to list/i).should("be.visible").click();
    cy.url().should("not.include", ParisTrip.id);
    cy.url().should("include", `/shared/${shareToken}`);
  });

  it("handles trip detail with null dates correctly", () => {
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getSharedTrips");

    cy.log("click on Bali trip which has null arrive/depart dates");
    cy.contains(BaliTrip.name).click();
    cy.url().should("include", `/shared/${shareToken}/${BaliTrip.id}`);

    cy.log("verify trip loads successfully");
    cy.contains("h1", BaliTrip.name).should("be.visible");

    cy.log("verify date fields handle null values");
    cy.get('input[name="arrive"]').should("have.value", "");
    cy.get('input[name="depart"]').should("have.value", "");

    cy.log("verify nights calculation works with null dates");
    cy.get('input[name="nights"]').should("have.value", BaliTrip.nights);
  });

  it("handles trip detail with different lodging calculation methods", () => {
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getSharedTrips");

    cy.log("view Tokyo trip with lodgingTotal");
    cy.contains(TokyoTrip.name).click();
    cy.get('input[name="lodgingTotal"]').should("have.value", TokyoTrip.lodgingTotal);
    cy.contains(/back to list/i).click();

    cy.log("view Paris trip with lodgingPerNight");
    cy.contains(ParisTrip.name).click();
    cy.get('input[name="lodgingPerNight"]').should("have.value", ParisTrip.lodgingPerNight);
    cy.contains(/back to list/i).click();

    cy.log("view Bali trip with lodgingPerPersonPerNight");
    cy.contains(BaliTrip.name).click();
    cy.get('input[name="lodgingPerPersonPerNight"]').should("have.value", BaliTrip.lodgingPerPersonPerNight);
  });

  it("handles invalid share token gracefully", () => {
    const invalidToken = "invalid-token";
    
    cy.intercept("POST", `${s}/rest/v1/rpc/get_shared_trip_list`, (req) => {
      if (req.body.token === invalidToken) {
        req.reply({ statusCode: 404, body: { message: "Not found" } });
      }
    }).as("getInvalidSharedTripList");

    cy.visit(`http://localhost:5173/trips/shared/${invalidToken}`);

    cy.log("verify error message is displayed");
    cy.contains(/trip list not found/i).should("be.visible");
    cy.contains(/invalid or has been revoked/i).should("be.visible");
  });

  it("handles trip not found in shared list", () => {
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getSharedTrips");

    cy.log("navigate to non-existent trip ID");
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}/nonexistent-id`);

    cy.log("verify trip not found message");
    cy.contains(/trip not found/i).should("be.visible");
    cy.contains(/could not be found in the shared list/i).should("be.visible");
  });

  it("verifies trip ID string comparison works correctly", () => {
    const numericIdTrip = {
      ...ParisTrip,
      id: 12345,
    };

    cy.intercept("POST", `${s}/rest/v1/rpc/get_shared_trips`, (req) => {
      if (req.body.token === shareToken) {
        req.reply([numericIdTrip]);
      }
    }).as("getNumericIdTrip");

    cy.visit(`http://localhost:5173/trips/shared/${shareToken}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getNumericIdTrip");

    cy.log("click on trip with numeric ID");
    cy.contains(numericIdTrip.name).click();
    cy.url().should("include", `/shared/${shareToken}/12345`);

    cy.log("verify trip details load despite numeric ID from DB vs string ID from URL");
    cy.contains("h1", numericIdTrip.name).should("be.visible");
    cy.contains(/trip not found/i).should("not.exist");
  });

  it("back navigation works from trip detail to trip list", () => {
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}/${ParisTrip.id}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getSharedTrips");

    cy.log("verify Back link is present");
    cy.contains(/back to list/i).should("be.visible");

    cy.log("click Back to return to list");
    cy.contains(/back to list/i).click();

    cy.log("verify returned to trip list");
    cy.url().should("eq", `http://localhost:5173/trips/shared/${shareToken}`);
    cy.contains(SharedTripList.name).should("be.visible");
    cy.contains(ParisTrip.name).should("be.visible");
    cy.contains(TokyoTrip.name).should("be.visible");
  });

  it("direct URL navigation to trip detail works", () => {
    cy.log("navigate directly to trip detail URL");
    cy.visit(`http://localhost:5173/trips/shared/${shareToken}/${TokyoTrip.id}`);
    
    cy.wait("@getSharedTripList");
    cy.wait("@getSharedTrips");

    cy.log("verify trip details are displayed");
    cy.contains("h1", TokyoTrip.name).should("be.visible");
    cy.contains(/you're viewing a shared trip/i).should("be.visible");
  });
});
