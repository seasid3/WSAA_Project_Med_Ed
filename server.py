from flask import Flask, request, jsonify, abort, send_from_directory
import BST_DAO as dao

app = Flask(__name__, static_folder='static')

REQUIRED_FIELDS = ['first_name', 'surname', 'dob', 'bst_scheme']

def validate_required(data):
    return [f for f in REQUIRED_FIELDS if not data.get(f)]

@app.route('/')
def index():
    return send_from_directory('static', 'BSTApplications.html')

@app.route('/applicants', methods=['GET'])
def get_all():
    return jsonify(dao.get_all())

@app.route('/applicants/offers', methods=['GET'])
def get_offers():
    return jsonify(dao.get_offers())

@app.route('/applicants/acceptances', methods=['GET'])
def get_acceptances():
    return jsonify(dao.get_acceptances())

@app.route('/applicants/<int:rcppi_id>', methods=['GET'])
def get_one(rcppi_id):
    applicant = dao.get_by_id(rcppi_id)
    if not applicant:
        abort(404)
    return jsonify(applicant)

@app.route('/applicants', methods=['POST'])
def create():
    data = request.get_json()
    missing = validate_required(data or {})
    if missing:
        abort(400, description=f"Missing required fields: {', '.join(missing)}")
    new_id = dao.create(data)
    return jsonify({'rcppi_id': new_id}), 201

@app.route('/applicants/<int:rcppi_id>', methods=['PUT'])
def update(rcppi_id):
    data = request.get_json()
    rows = dao.update(rcppi_id, data or {})
    if rows == 0:
        abort(404)
    return jsonify({'updated': rows})

@app.route('/applicants/<int:rcppi_id>', methods=['DELETE'])
def delete(rcppi_id):
    rows = dao.delete(rcppi_id)
    if rows == 0:
        abort(404)
    return jsonify({'deleted': rows})

if __name__ == '__main__':
    app.run(debug=True)
